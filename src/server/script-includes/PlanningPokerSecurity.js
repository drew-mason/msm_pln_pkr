import { gs, GlideRecord } from '@servicenow/glide'

// PlanningPokerSecurity - Centralized authorization utility
var PlanningPokerSecurity = Class.create();
PlanningPokerSecurity.prototype = {
    initialize: function() {},

    // Check if user can access a session (view/participate)
    canAccessSession: function(sessionId, userId) {
        try {
            userId = userId || gs.getUserID();
            if (!sessionId || !userId) return false;

            // Admin roles always have access
            if (this.hasAdminAccess(userId)) return true;

            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) return false;

            // Check if user is session dealer
            if (this.isSessionDealer(sessionGr, userId)) return true;

            // Check if user has active participant record
            var participantGr = new GlideRecord('x_902080_planningw_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.addQuery('status', 'active');
            participantGr.query();
            
            if (participantGr.next()) return true;

            // Check spectator permission if spectators are allowed
            if (sessionGr.getValue('allow_spectators') === 'true') {
                return true; // Allow spectator access
            }

            // Legacy role fallback
            return this.hasAppRole(userId, ['x_902080_planningw.admin', 'x_902080_planningw.facilitator', 'x_902080_planningw.dealer', 'x_902080_planningw.voter', 'x_902080_planningw.spectator']);

        } catch (e) {
            gs.error('[PlanningPokerSecurity] canAccessSession error: ' + String(e.message));
            return false;
        }
    },

    // Check if user can manage a session (dealer functions)
    canManageSession: function(sessionId, userId) {
        try {
            userId = userId || gs.getUserID();
            if (!sessionId || !userId) return false;

            // Admin always can manage
            if (this.hasAdminAccess(userId)) return true;

            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) return false;

            // Check if user is session dealer
            if (this.isSessionDealer(sessionGr, userId)) return true;

            // Check if user is in dealer group
            var dealerGroupId = sessionGr.getValue('dealer_group');
            if (dealerGroupId && this.isUserInGroup(userId, dealerGroupId)) {
                return true;
            }

            return false;

        } catch (e) {
            gs.error('[PlanningPokerSecurity] canManageSession error: ' + String(e.message));
            return false;
        }
    },

    // Check if user is session dealer or facilitator
    isSessionDealer: function(sessionGr, userId) {
        userId = userId || gs.getUserID();
        if (this.hasAdminAccess(userId)) return true;

        var dealerId = sessionGr.getValue('dealer');
        var facilitatorId = sessionGr.getValue('facilitator');
        
        return (dealerId === userId || facilitatorId === userId);
    },

    // Check if user can vote in session
    canVote: function(sessionId, userId) {
        try {
            if (!this.canAccessSession(sessionId, userId)) return false;
            
            var role = this.getUserRole(sessionId, userId);
            return (role === 'dealer' || role === 'voter');

        } catch (e) {
            gs.error('[PlanningPokerSecurity] canVote error: ' + String(e.message));
            return false;
        }
    },

    // Get user's effective role in session
    getUserRole: function(sessionId, userId) {
        try {
            userId = userId || gs.getUserID();
            
            // Check participant record first
            var participantGr = new GlideRecord('x_902080_planningw_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.query();
            
            if (participantGr.next()) {
                return participantGr.getValue('role');
            }

            // Check if session dealer
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (sessionGr.get(sessionId) && this.isSessionDealer(sessionGr, userId)) {
                return 'dealer';
            }

            return 'spectator'; // Default role

        } catch (e) {
            gs.error('[PlanningPokerSecurity] getUserRole error: ' + String(e.message));
            return 'spectator';
        }
    },

    // Check if user is in voter group for session
    isUserInVoterGroup: function(sessionId, userId) {
        try {
            userId = userId || gs.getUserID();
            
            var voterGroupGr = new GlideRecord('x_902080_planningw_session_voter_groups');
            voterGroupGr.addQuery('session', sessionId);
            voterGroupGr.query();
            
            while (voterGroupGr.next()) {
                var groupId = voterGroupGr.getValue('voter_group');
                if (this.isUserInGroup(userId, groupId)) {
                    return true;
                }
            }
            
            return false;

        } catch (e) {
            gs.error('[PlanningPokerSecurity] isUserInVoterGroup error: ' + String(e.message));
            return false;
        }
    },

    // Check if session has voter group restrictions
    sessionHasVoterGroups: function(sessionId) {
        try {
            var voterGroupGr = new GlideRecord('x_902080_planningw_session_voter_groups');
            voterGroupGr.addQuery('session', sessionId);
            voterGroupGr.query();
            
            return voterGroupGr.getRowCount() > 0;

        } catch (e) {
            gs.error('[PlanningPokerSecurity] sessionHasVoterGroups error: ' + String(e.message));
            return false;
        }
    },

    // Helper: Check if user has admin access
    hasAdminAccess: function(userId) {
        userId = userId || gs.getUserID();
        return this.hasAppRole(userId, ['x_902080_planningw.admin', 'admin']);
    },

    // Helper: Check if user has specific app roles
    hasAppRole: function(userId, roles) {
        if (!userId || !roles) return false;
        
        for (var i = 0; i < roles.length; i++) {
            if (gs.hasRole(roles[i], userId)) {
                return true;
            }
        }
        return false;
    },

    // Helper: Check if user is in group
    isUserInGroup: function(userId, groupId) {
        try {
            var groupMemberGr = new GlideRecord('sys_user_grmember');
            groupMemberGr.addQuery('user', userId);
            groupMemberGr.addQuery('group', groupId);
            groupMemberGr.query();
            
            return groupMemberGr.next();

        } catch (e) {
            gs.error('[PlanningPokerSecurity] isUserInGroup error: ' + String(e.message));
            return false;
        }
    },

    type: 'PlanningPokerSecurity'
};