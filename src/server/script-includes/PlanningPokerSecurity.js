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

            var sessionGr = new GlideRecord('pp_planning_session');
            if (!sessionGr.get(sessionId)) return false;

            // Check if user is session dealer
            if (this.isSessionDealer(sessionGr, userId)) return true;

            // Check if user has active participant record
            var participantGr = new GlideRecord('pp_session_participant');
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
            var roles = ['admin', 'pp_admin', 'pp_facilitator', 'pp_dealer', 'pp_voter', 'pp_spectator'];
            return this.hasAppRole(userId, roles);

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

            var sessionGr = new GlideRecord('pp_planning_session');
            if (!sessionGr.get(sessionId)) return false;

            // Check if user is session creator/dealer
            if (this.isSessionDealer(sessionGr, userId)) return true;

            // Check if user has been promoted to dealer role in this session
            var partGr = new GlideRecord('pp_session_participant');
            partGr.addQuery('session', sessionId);
            partGr.addQuery('user', userId);
            partGr.addQuery('role', 'dealer');
            partGr.setLimit(1);
            partGr.query();
            if (partGr.next()) return true;

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
            
            var roleData = this.getUserRole(sessionId, userId);
            var role = roleData.role;
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
            
            // 1. Get explicit participant role
            var participantRole = null;
            var participantGr = new GlideRecord('pp_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.setLimit(1);
            participantGr.query();
            
            if (participantGr.next()) {
                participantRole = participantGr.getValue('role');
            }

            // 2. Check Dealer permissions
            var isDealer = this.canManageSession(sessionId, userId);

            // 3. Determine Effective Role
            var effectiveRole = participantRole;
            
            if (!effectiveRole) {
                if (isDealer) {
                    effectiveRole = 'dealer';
                } else {
                    effectiveRole = 'spectator';
                }
            }

            return {
                role: effectiveRole,
                isDealer: isDealer,
                participantRole: participantRole
            };

        } catch (e) {
            gs.error('[PlanningPokerSecurity] getUserRole error: ' + String(e.message));
            return {
                role: 'spectator',
                isDealer: false,
                participantRole: null
            };
        }
    },

    // Check if user is in voter group for session
    isUserInVoterGroup: function(sessionId, userId) {
        try {
            userId = userId || gs.getUserID();
            
            // 1. Collect all allowed group IDs
            var groupIds = [];
            var voterGroupGr = new GlideRecord('pp_session_voter_groups');
            voterGroupGr.addQuery('session', sessionId);
            voterGroupGr.query();
            
            while (voterGroupGr.next()) {
                groupIds.push(voterGroupGr.getValue('voter_group'));
            }
            
            if (groupIds.length === 0) return false;

            // 2. Check if user is in any of these groups
            var memberGr = new GlideRecord('sys_user_grmember');
            memberGr.addQuery('user', userId);
            memberGr.addQuery('group', 'IN', groupIds);
            memberGr.setLimit(1);
            memberGr.query();
            
            return memberGr.hasNext();

        } catch (e) {
            gs.error('[PlanningPokerSecurity] isUserInVoterGroup error: ' + String(e.message));
            return false;
        }
    },

    // Check if session has voter group restrictions
    sessionHasVoterGroups: function(sessionId) {
        try {
            var voterGroupGr = new GlideRecord('pp_session_voter_groups');
            voterGroupGr.addQuery('session', sessionId);
            voterGroupGr.setLimit(1);
            voterGroupGr.query();
            
            return voterGroupGr.hasNext();

        } catch (e) {
            gs.error('[PlanningPokerSecurity] sessionHasVoterGroups error: ' + String(e.message));
            return false;
        }
    },

    // Helper: Check if user has admin access
    hasAdminAccess: function(userId) {
        userId = userId || gs.getUserID();
        return this.hasAppRole(userId, ['admin', 'pp_admin']);
    },

    // Helper: Check if user has specific app roles
    hasAppRole: function(userId, roles) {
        if (!userId || !roles) return false;
        
        // For the current user, use gs.hasRole directly
        if (userId === gs.getUserID()) {
            for (var i = 0; i < roles.length; i++) {
                if (gs.hasRole(roles[i])) {
                    return true;
                }
            }
            return false;
        }
        
        // For other users, query sys_user_has_role directly
        var roleGr = new GlideRecord('sys_user_has_role');
        roleGr.addQuery('user', userId);
        roleGr.addQuery('state', 'active');
        roleGr.addQuery('role.name', 'IN', roles.join(','));
        roleGr.setLimit(1);
        roleGr.query();
        return roleGr.hasNext();
    },

    type: 'PlanningPokerSecurity'
};