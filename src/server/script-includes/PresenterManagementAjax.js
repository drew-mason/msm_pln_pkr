var PresenterManagementAjax = Class.create();
PresenterManagementAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    getDealers: function() {
        try {
            var sessionId = this.getParameter('session_id');
            
            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canAccessSession(sessionGr, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            var dealers = [];
            
            // Get all active dealer participants
            var partGr = new GlideRecord('x_902080_planningw_session_participant');
            partGr.addQuery('session', sessionId);
            partGr.addQuery('role', 'dealer');
            partGr.addQuery('status', 'active');
            partGr.orderBy('user.name');
            partGr.query();
            
            while (partGr.next()) {
                var dealerUserId = partGr.getValue('user');
                var userGr = new GlideRecord('sys_user');
                
                if (userGr.get(dealerUserId)) {
                    dealers.push({
                        userId: dealerUserId,
                        name: userGr.getValue('name'),
                        firstName: userGr.getValue('first_name'),
                        lastName: userGr.getValue('last_name'),
                        isPresenter: partGr.getValue('is_presenter') == 'true',
                        isOnline: partGr.getValue('is_online') == 'true',
                        joinedAt: partGr.getValue('joined_at')
                    });
                }
            }
            
            return this._buildResponse(true, 'Dealers retrieved', dealers);
            
        } catch (e) {
            gs.error('[PresenterManagementAjax] getDealers error: ' + e);
            return this._buildResponse(false, 'Error retrieving dealers: ' + e, null);
        }
    },
    
    setPresenter: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var presenterId = this.getParameter('presenter_id');
            
            if (!sessionId || !presenterId) {
                return this._buildResponse(false, 'Session ID and presenter ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'You do not have permission to manage presenters', null);
            }
            
            // Verify presenter is a dealer participant
            var presenterPartGr = new GlideRecord('x_902080_planningw_session_participant');
            presenterPartGr.addQuery('session', sessionId);
            presenterPartGr.addQuery('user', presenterId);
            presenterPartGr.addQuery('role', 'dealer');
            presenterPartGr.addQuery('status', 'active');
            presenterPartGr.query();
            
            if (!presenterPartGr.next()) {
                return this._buildResponse(false, 'User is not an active dealer in this session', null);
            }
            
            // Clear existing presenter flags
            var allDealerGr = new GlideRecord('x_902080_planningw_session_participant');
            allDealerGr.addQuery('session', sessionId);
            allDealerGr.addQuery('role', 'dealer');
            allDealerGr.query();
            
            while (allDealerGr.next()) {
                allDealerGr.setValue('is_presenter', false);
                allDealerGr.update();
            }
            
            // Set new presenter flag
            presenterPartGr.setValue('is_presenter', true);
            presenterPartGr.update();
            
            // Update session active_presenter
            sessionGr.setValue('active_presenter', presenterId);
            sessionGr.update();
            
            // Get presenter name for response
            var presenterUserGr = new GlideRecord('sys_user');
            var presenterName = 'Unknown';
            if (presenterUserGr.get(presenterId)) {
                presenterName = presenterUserGr.getValue('name');
            }
            
            gs.info('[PresenterManagementAjax] Set presenter: ' + presenterName + ' for session: ' + sessionId);
            
            return this._buildResponse(true, 'Presenter set successfully', {
                presenterId: presenterId,
                presenterName: presenterName
            });
            
        } catch (e) {
            gs.error('[PresenterManagementAjax] setPresenter error: ' + e);
            return this._buildResponse(false, 'Error setting presenter: ' + e, null);
        }
    },
    
    addDealerGroup: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var dealerGroupId = this.getParameter('dealer_group_id');
            
            if (!sessionId || !dealerGroupId) {
                return this._buildResponse(false, 'Session ID and dealer group ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'You do not have permission to add dealer groups', null);
            }
            
            // Update session dealer group
            sessionGr.setValue('dealer_group', dealerGroupId);
            sessionGr.update();
            
            // Add group members as dealer participants
            var addedCount = this._addDealerGroupMembers(sessionId, dealerGroupId);
            
            return this._buildResponse(true, 'Dealer group added successfully', {
                addedDealers: addedCount
            });
            
        } catch (e) {
            gs.error('[PresenterManagementAjax] addDealerGroup error: ' + e);
            return this._buildResponse(false, 'Error adding dealer group: ' + e, null);
        }
    },
    
    updateStoryPresenter: function() {
        try {
            var storyId = this.getParameter('story_id');
            var presenterId = this.getParameter('presenter_id');
            
            if (!storyId) {
                return this._buildResponse(false, 'Story ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Get story and session
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, 'Story not found', null);
            }
            
            var sessionId = storyGr.getValue('session');
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            // Check permissions
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'You do not have permission to update story presenters', null);
            }
            
            // If presenter specified, verify they're a dealer
            if (presenterId) {
                var presenterPartGr = new GlideRecord('x_902080_planningw_session_participant');
                presenterPartGr.addQuery('session', sessionId);
                presenterPartGr.addQuery('user', presenterId);
                presenterPartGr.addQuery('role', 'dealer');
                presenterPartGr.addQuery('status', 'active');
                presenterPartGr.query();
                
                if (!presenterPartGr.next()) {
                    return this._buildResponse(false, 'Presenter must be an active dealer in this session', null);
                }
            }
            
            // Update story presenter
            storyGr.setValue('presenter', presenterId || '');
            storyGr.update();
            
            var presenterName = '';
            if (presenterId) {
                var presenterUserGr = new GlideRecord('sys_user');
                if (presenterUserGr.get(presenterId)) {
                    presenterName = presenterUserGr.getValue('name');
                }
            }
            
            return this._buildResponse(true, 'Story presenter updated successfully', {
                storyId: storyId,
                presenterId: presenterId,
                presenterName: presenterName
            });
            
        } catch (e) {
            gs.error('[PresenterManagementAjax] updateStoryPresenter error: ' + e);
            return this._buildResponse(false, 'Error updating story presenter: ' + e, null);
        }
    },
    
    // Helper methods
    _addDealerGroupMembers: function(sessionId, dealerGroupId) {
        var addedCount = 0;
        
        var groupMemberGr = new GlideRecord('sys_user_grmember');
        groupMemberGr.addQuery('group', dealerGroupId);
        groupMemberGr.query();
        
        while (groupMemberGr.next()) {
            var memberId = groupMemberGr.getValue('user');
            
            // Check if already a participant
            var existingGr = new GlideRecord('x_902080_planningw_session_participant');
            existingGr.addQuery('session', sessionId);
            existingGr.addQuery('user', memberId);
            existingGr.query();
            
            if (!existingGr.hasNext()) {
                // Add as new dealer participant
                var participantGr = new GlideRecord('x_902080_planningw_session_participant');
                participantGr.initialize();
                participantGr.setValue('session', sessionId);
                participantGr.setValue('user', memberId);
                participantGr.setValue('role', 'dealer');
                participantGr.setValue('status', 'active');
                participantGr.setValue('joined_at', new GlideDateTime());
                participantGr.setValue('is_online', false);
                participantGr.insert();
                
                addedCount++;
            } else if (existingGr.next() && existingGr.getValue('role') !== 'dealer') {
                // Update existing participant to dealer role
                existingGr.setValue('role', 'dealer');
                existingGr.update();
                addedCount++;
            }
        }
        
        return addedCount;
    },
    
    _buildResponse: function(success, message, data) {
        var response = JSON.stringify({
            success: success,
            message: message,
            data: data
        });
        this.setAnswer(response);
        return response;
    },

    type: 'PresenterManagementAjax'
});