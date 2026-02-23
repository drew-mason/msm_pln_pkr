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
            participantGr.addQuery('status', PlanningPokerConstants.STATUS.ACTIVE);
            participantGr.query();
            
            if (participantGr.next()) return true;

            // Check spectator permission if spectators are allowed
            if (sessionGr.getValue('allow_spectators') === 'true') {
                return true; // Allow spectator access
            }

            // Legacy role fallback
            var roles = [
                PlanningPokerConstants.ROLES.ADMIN,
                PlanningPokerConstants.ROLES.FACILITATOR,
                'x_902080_planningw.dealer',
                'x_902080_planningw.voter',
                'x_902080_planningw.spectator'
            ];
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
            
            var roleData = this.getUserRole(sessionId, userId);
            var role = roleData.role;
            return (role === PlanningPokerConstants.ROLES.DEALER || role === PlanningPokerConstants.ROLES.VOTER);

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
            var participantGr = new GlideRecord('x_902080_planningw_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.setLimit(1);
            participantGr.query();
            
            if (participantGr.next()) {
                participantRole = participantGr.getValue('role');
                // Normalize role if it contains scope prefix
                if (participantRole && participantRole.indexOf('.') > -1) {
                    participantRole = participantRole.split('.').pop();
                }
            }

            // 2. Check Dealer permissions (Owner, Facilitator, or Group)
            var isDealer = this.canManageSession(sessionId, userId);

            // 3. Determine Effective Role
            // If explicit role exists, prefer it, unless they are a dealer but joined as voter? 
            // Usually dealer privs override unless explicitly in spectator mode?
            // For now, mirroring logic: Explicit role takes precedence, but if no role & isDealer -> Dealer.
            
            var effectiveRole = participantRole;
            
            if (!effectiveRole) {
                if (isDealer) {
                    effectiveRole = PlanningPokerConstants.ROLES.DEALER;
                } else {
                    effectiveRole = PlanningPokerConstants.ROLES.SPECTATOR;
                }
            } else if (isDealer && participantRole === PlanningPokerConstants.ROLES.VOTER) {
                 // Even if listed as voter, if they have dealer rights, they can act as dealer?
                 // Keeping it simple: return object allowing caller to decide
            }

            return {
                role: effectiveRole,
                isDealer: isDealer,
                participantRole: participantRole
            };

        } catch (e) {
            gs.error('[PlanningPokerSecurity] getUserRole error: ' + String(e.message));
            return {
                role: PlanningPokerConstants.ROLES.SPECTATOR,
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
            var voterGroupGr = new GlideRecord('x_902080_planningw_session_voter_groups');
            voterGroupGr.addQuery('session', sessionId);
            voterGroupGr.query();
            
            while (voterGroupGr.next()) {
                groupIds.push(voterGroupGr.getValue('voter_group'));
            }
            
            if (groupIds.length === 0) return false;

            // 2. Single query to check if user is in ANY of these groups
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
            var voterGroupGr = new GlideRecord('x_902080_planningw_session_voter_groups');
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
        return this.hasAppRole(userId, [PlanningPokerConstants.ROLES.ADMIN, 'admin']);
    },

    // Helper: Check if user has specific app roles
    hasAppRole: function(userId, roles) {
        if (!userId || !roles) return false;
        
        // gs.hasRole only checks the current user — the 2nd param does NOT override the user.
        // For the current user, use gs.hasRole directly.
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