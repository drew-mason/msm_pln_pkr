var PresenterManagementAjax = Class.create();
PresenterManagementAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
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
            if (!security.canAccessSession(sessionId, userId)) {
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
                
                dealers.push({
                    userId: dealerUserId,
                    name: partGr.getDisplayValue('user'),
                    firstName: partGr.user.first_name.toString(),
                    lastName: partGr.user.last_name.toString(),
                    isPresenter: partGr.getValue('is_presenter') == 'true',
                    isOnline: partGr.getValue('is_online') == 'true',
                    joinedAt: partGr.getValue('joined_at')
                });
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
            if (!security.canManageSession(sessionId, userId)) {
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
            
            // Clear existing presenter flags in one operation
            var allDealerGr = new GlideRecord('x_902080_planningw_session_participant');
            allDealerGr.addQuery('session', sessionId);
            allDealerGr.addQuery('role', 'dealer');
            allDealerGr.addQuery('is_presenter', true);
            allDealerGr.setValue('is_presenter', false);
            allDealerGr.updateMultiple();
            
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
            if (!security.canManageSession(sessionId, userId)) {
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
            if (!security.canManageSession(sessionId, userId)) {
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
        // Delegate to canonical implementation in SessionManagementAjax
        var smAjax = new SessionManagementAjax();
        return smAjax._addDealerGroupMembers(sessionId, dealerGroupId, null);
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