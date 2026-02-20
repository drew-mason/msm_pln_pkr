var SessionParticipantAjax = Class.create();
SessionParticipantAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    joinSession: function() {
        try {
            var sessionCode = this.getParameter('session_code');
            
            if (!sessionCode) {
                return this._buildResponse(false, 'Session code required', null);
            }
            
            var userId = gs.getUserID();
            
            // Find session by code
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            sessionGr.addQuery('session_code', sessionCode.toUpperCase());
            sessionGr.addQuery('active', true);
            sessionGr.query();
            
            if (!sessionGr.next()) {
                return this._buildResponse(false, 'Session not found or inactive', null);
            }
            
            var sessionId = sessionGr.getValue('sys_id');
            var sessionStatus = sessionGr.getValue('status');
            
            if (sessionStatus === 'completed' || sessionStatus === 'cancelled') {
                return this._buildResponse(false, 'This session has ended', null);
            }
            
            // Check if user already has a participant record
            var participantGr = new GlideRecord('x_902080_planningw_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.query();
            
            if (participantGr.next()) {
                // User already joined - reactivate with existing role
                if (participantGr.getValue('status') !== 'active') {
                    participantGr.setValue('status', 'active');
                    participantGr.setValue('joined_at', new GlideDateTime());
                    participantGr.setValue('is_online', true);
                    participantGr.update();
                }
                
                return this._buildResponse(true, 'Rejoined session successfully', {
                    sessionId: sessionId,
                    role: participantGr.getValue('role'),
                    sessionName: sessionGr.getValue('name')
                });
            } else {
                // New participant - determine role and validate
                var role = this._determineJoinRole(sessionGr, userId);
                
                if (!role) {
                    return this._buildResponse(false, 'You are not authorized to join this session', null);
                }
                
                // Create participant record
                participantGr.initialize();
                participantGr.setValue('session', sessionId);
                participantGr.setValue('user', userId);
                participantGr.setValue('role', role);
                participantGr.setValue('status', 'active');
                participantGr.setValue('joined_at', new GlideDateTime());
                participantGr.setValue('is_online', true);
                participantGr.insert();
                
                gs.info('[SessionParticipantAjax] User ' + userId + ' joined session ' + sessionId + ' as ' + role);
                
                return this._buildResponse(true, 'Joined session successfully', {
                    sessionId: sessionId,
                    role: role,
                    sessionName: sessionGr.getValue('name')
                });
            }
            
        } catch (e) {
            gs.error('[SessionParticipantAjax] joinSession error: ' + e);
            return this._buildResponse(false, 'Error joining session: ' + e, null);
        }
    },
    
    leaveSession: function() {
        try {
            var sessionId = this.getParameter('session_id');
            
            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Update participant status
            var participantGr = new GlideRecord('x_902080_planningw_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.query();
            
            if (participantGr.next()) {
                participantGr.setValue('status', 'left');
                participantGr.setValue('is_online', false);
                participantGr.update();
                
                return this._buildResponse(true, 'Left session successfully', null);
            } else {
                return this._buildResponse(false, 'Participant record not found', null);
            }
            
        } catch (e) {
            gs.error('[SessionParticipantAjax] leaveSession error: ' + e);
            return this._buildResponse(false, 'Error leaving session: ' + e, null);
        }
    },
    
    getSessionByCode: function() {
        try {
            var sessionCode = this.getParameter('session_code');
            
            if (!sessionCode) {
                return this._buildResponse(false, 'Session code required', null);
            }
            
            // Find session by code
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            sessionGr.addQuery('session_code', sessionCode.toUpperCase());
            sessionGr.addQuery('active', true);
            sessionGr.query();
            
            if (!sessionGr.next()) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            // Get dealer name
            var dealerName = '';
            var dealerGr = new GlideRecord('sys_user');
            if (dealerGr.get(sessionGr.getValue('dealer'))) {
                dealerName = dealerGr.getValue('name');
            }
            
            var sessionData = {
                sys_id: sessionGr.getValue('sys_id'),
                name: sessionGr.getValue('name'),
                description: sessionGr.getValue('description'),
                status: sessionGr.getValue('status'),
                sessionCode: sessionGr.getValue('session_code'),
                dealerName: dealerName,
                allowSpectators: sessionGr.getValue('allow_spectators') == 'true'
            };
            
            return this._buildResponse(true, 'Session found', sessionData);
            
        } catch (e) {
            gs.error('[SessionParticipantAjax] getSessionByCode error: ' + e);
            return this._buildResponse(false, 'Error finding session: ' + e, null);
        }
    },
    
    switchRole: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var newRole = this.getParameter('new_role');
            
            if (!sessionId || !newRole) {
                return this._buildResponse(false, 'Session ID and new role required', null);
            }
            
            var userId = gs.getUserID();
            
            // Validate new role
            if (['dealer', 'voter'].indexOf(newRole) === -1) {
                return this._buildResponse(false, 'Invalid role', null);
            }
            
            // Check session permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canAccessSession(sessionGr, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            // Check if user can switch to this role
            var isSessionDealer = (userId == sessionGr.getValue('dealer')) || (userId == sessionGr.getValue('facilitator'));
            var isInDealerGroup = false;
            
            var dealerGroupId = sessionGr.getValue('dealer_group');
            if (dealerGroupId) {
                var groupMemberGr = new GlideRecord('sys_user_grmember');
                groupMemberGr.addQuery('group', dealerGroupId);
                groupMemberGr.addQuery('user', userId);
                groupMemberGr.query();
                isInDealerGroup = groupMemberGr.hasNext();
            }
            
            var canBeDealer = isSessionDealer || isInDealerGroup;
            
            if (newRole === 'dealer' && !canBeDealer) {
                return this._buildResponse(false, 'You do not have permission to switch to dealer role', null);
            }
            
            // Update participant role
            var participantGr = new GlideRecord('x_902080_planningw_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.query();
            
            if (participantGr.next()) {
                participantGr.setValue('role', newRole);
                participantGr.update();
                
                return this._buildResponse(true, 'Role switched to ' + newRole, {
                    newRole: newRole
                });
            } else {
                return this._buildResponse(false, 'Participant record not found', null);
            }
            
        } catch (e) {
            gs.error('[SessionParticipantAjax] switchRole error: ' + e);
            return this._buildResponse(false, 'Error switching role: ' + e, null);
        }
    },
    
    changeParticipantRole: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var participantUserId = this.getParameter('participant_user_id');
            var newRole = this.getParameter('new_role');
            
            if (!sessionId || !participantUserId || !newRole) {
                return this._buildResponse(false, 'Session ID, participant user ID, and new role required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check if current user can manage session
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'You do not have permission to change participant roles', null);
            }
            
            // Validate role
            if (['dealer', 'voter', 'spectator'].indexOf(newRole) === -1) {
                return this._buildResponse(false, 'Invalid role', null);
            }
            
            // Update participant role
            var participantGr = new GlideRecord('x_902080_planningw_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', participantUserId);
            participantGr.query();
            
            if (participantGr.next()) {
                participantGr.setValue('role', newRole);
                participantGr.update();
                
                return this._buildResponse(true, 'Participant role changed to ' + newRole, null);
            } else {
                return this._buildResponse(false, 'Participant not found', null);
            }
            
        } catch (e) {
            gs.error('[SessionParticipantAjax] changeParticipantRole error: ' + e);
            return this._buildResponse(false, 'Error changing participant role: ' + e, null);
        }
    },
    
    // Helper methods
    _determineJoinRole: function(sessionGr, userId) {
        var sessionId = sessionGr.getValue('sys_id');
        
        // Check if user is session dealer/facilitator
        var dealerId = sessionGr.getValue('dealer');
        var facilitatorId = sessionGr.getValue('facilitator');
        if (userId == dealerId || userId == facilitatorId) {
            return 'dealer';
        }
        
        // Check if user is in dealer group
        var dealerGroupId = sessionGr.getValue('dealer_group');
        if (dealerGroupId) {
            var groupMemberGr = new GlideRecord('sys_user_grmember');
            groupMemberGr.addQuery('group', dealerGroupId);
            groupMemberGr.addQuery('user', userId);
            groupMemberGr.query();
            
            if (groupMemberGr.hasNext()) {
                return 'dealer';
            }
        }
        
        // Check voter group restrictions
        var security = new PlanningPokerSecurity();
        var hasVoterGroups = security.sessionHasVoterGroups(sessionId);
        
        if (hasVoterGroups) {
            var isInVoterGroup = security.isUserInVoterGroup(sessionId, userId);
            if (isInVoterGroup) {
                return 'voter';
            } else {
                // Not in voter group - check if spectators allowed
                var allowSpectators = sessionGr.getValue('allow_spectators') == 'true';
                if (allowSpectators) {
                    return 'spectator';
                } else {
                    return null; // Cannot join
                }
            }
        } else {
            // No voter group restrictions - default to voter
            return 'voter';
        }
    },
    
    _buildResponse: function(success, message, data) {
        return {
            success: success,
            message: message,
            data: data
        };
    },

    type: 'SessionParticipantAjax'
});