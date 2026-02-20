var PermissionsAdminAjax = Class.create();
PermissionsAdminAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    getPermissionsData: function() {
        try {
            gs.info('[PermissionsAdminAjax] Getting permissions data');
            
            var userId = gs.getUserID();
            
            // Check admin permissions
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }
            
            // Get current permission settings from system properties
            var restrictedMode = gs.getProperty('x_902080_planningw.session.creation.restricted', 'false') === 'true';
            var allowedGroups = this._getAllowedGroups();
            
            // Get statistics
            var stats = this._getPermissionStats();
            
            var data = {
                restrictedMode: restrictedMode,
                allowedGroups: allowedGroups,
                stats: stats
            };
            
            return this._buildResponse(true, 'Permissions data retrieved', data);
            
        } catch (e) {
            gs.error('[PermissionsAdminAjax] getPermissionsData error: ' + e);
            return this._buildResponse(false, 'Error retrieving permissions data: ' + e, null);
        }
    },
    
    setRestrictedMode: function() {
        try {
            var restricted = this.getParameter('restricted') === 'true';
            var userId = gs.getUserID();
            
            // Check admin permissions
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }
            
            // Set system property
            gs.setProperty('x_902080_planningw.session.creation.restricted', restricted ? 'true' : 'false');
            
            gs.info('[PermissionsAdminAjax] Session creation restricted mode set to: ' + restricted);
            
            return this._buildResponse(true, 'Restricted mode updated successfully', {
                restrictedMode: restricted
            });
            
        } catch (e) {
            gs.error('[PermissionsAdminAjax] setRestrictedMode error: ' + e);
            return this._buildResponse(false, 'Error setting restricted mode: ' + e, null);
        }
    },
    
    addAllowedGroup: function() {
        try {
            var groupId = this.getParameter('group_id');
            var userId = gs.getUserID();
            
            if (!groupId) {
                return this._buildResponse(false, 'Group ID required', null);
            }
            
            // Check admin permissions
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }
            
            // Verify group exists
            var groupGr = new GlideRecord('sys_user_group');
            if (!groupGr.get(groupId)) {
                return this._buildResponse(false, 'Group not found', null);
            }
            
            var groupName = groupGr.getValue('name');
            
            // Add to allowed groups list
            var currentGroups = this._getAllowedGroupIds();
            if (currentGroups.indexOf(groupId) === -1) {
                currentGroups.push(groupId);
                this._setAllowedGroups(currentGroups);
            }
            
            return this._buildResponse(true, 'Group added successfully', {
                groupId: groupId,
                groupName: groupName
            });
            
        } catch (e) {
            gs.error('[PermissionsAdminAjax] addAllowedGroup error: ' + e);
            return this._buildResponse(false, 'Error adding allowed group: ' + e, null);
        }
    },
    
    removeAllowedGroup: function() {
        try {
            var groupId = this.getParameter('group_id');
            var userId = gs.getUserID();
            
            if (!groupId) {
                return this._buildResponse(false, 'Group ID required', null);
            }
            
            // Check admin permissions
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }
            
            // Remove from allowed groups list
            var currentGroups = this._getAllowedGroupIds();
            var index = currentGroups.indexOf(groupId);
            
            if (index > -1) {
                currentGroups.splice(index, 1);
                this._setAllowedGroups(currentGroups);
            }
            
            return this._buildResponse(true, 'Group removed successfully', {
                groupId: groupId
            });
            
        } catch (e) {
            gs.error('[PermissionsAdminAjax] removeAllowedGroup error: ' + e);
            return this._buildResponse(false, 'Error removing allowed group: ' + e, null);
        }
    },
    
    getUserGroups: function() {
        try {
            var searchTerm = this.getParameter('search_term') || '';
            var userId = gs.getUserID();
            
            // Check admin permissions
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }
            
            var groups = [];
            var groupGr = new GlideRecord('sys_user_group');
            groupGr.addQuery('active', true);
            
            if (searchTerm.length > 0) {
                var qc = groupGr.addQuery('name', 'CONTAINS', searchTerm);
                qc.addOrCondition('description', 'CONTAINS', searchTerm);
            }
            
            groupGr.orderBy('name');
            groupGr.setLimit(50);
            groupGr.query();
            
            while (groupGr.next()) {
                groups.push({
                    sys_id: groupGr.getValue('sys_id'),
                    name: groupGr.getValue('name'),
                    description: groupGr.getValue('description'),
                    memberCount: this._getGroupMemberCount(groupGr.getValue('sys_id'))
                });
            }
            
            return this._buildResponse(true, 'User groups retrieved', groups);
            
        } catch (e) {
            gs.error('[PermissionsAdminAjax] getUserGroups error: ' + e);
            return this._buildResponse(false, 'Error retrieving user groups: ' + e, null);
        }
    },
    
    testUserPermissions: function() {
        try {
            var testUserId = this.getParameter('test_user_id');
            var userId = gs.getUserID();
            
            if (!testUserId) {
                return this._buildResponse(false, 'Test user ID required', null);
            }
            
            // Check admin permissions
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }
            
            // Get test user info
            var testUserGr = new GlideRecord('sys_user');
            if (!testUserGr.get(testUserId)) {
                return this._buildResponse(false, 'Test user not found', null);
            }
            
            var testUserName = testUserGr.getValue('name');
            
            // Test permission logic
            var canCreate = this._testUserCanCreateSessions(testUserId);
            var reasons = [];
            
            // Check specific permission sources
            var hasAppRoles = this._userHasAppRoles(testUserId);
            var hasLegacyRoles = this._userHasLegacyRoles(testUserId);
            var inAllowedGroups = this._userInAllowedGroups(testUserId);
            
            if (hasAppRoles) {
                reasons.push('Has Planning Poker application roles');
            }
            
            if (hasLegacyRoles) {
                reasons.push('Has legacy admin/itil roles');
            }
            
            if (inAllowedGroups) {
                var userGroups = this._getUserAllowedGroups(testUserId);
                reasons.push('Member of allowed groups: ' + userGroups.join(', '));
            }
            
            if (!canCreate) {
                var restrictedMode = gs.getProperty('x_902080_planningw.session.creation.restricted', 'false') === 'true';
                if (restrictedMode) {
                    reasons.push('Session creation is in restricted mode');
                }
                reasons.push('User does not meet permission requirements');
            }
            
            return this._buildResponse(true, 'User permissions tested', {
                testUserId: testUserId,
                testUserName: testUserName,
                canCreateSessions: canCreate,
                reasons: reasons
            });
            
        } catch (e) {
            gs.error('[PermissionsAdminAjax] testUserPermissions error: ' + e);
            return this._buildResponse(false, 'Error testing user permissions: ' + e, null);
        }
    },
    
    // Helper methods
    _getAllowedGroups: function() {
        var groupIds = this._getAllowedGroupIds();
        var groups = [];
        
        for (var i = 0; i < groupIds.length; i++) {
            var groupGr = new GlideRecord('sys_user_group');
            if (groupGr.get(groupIds[i])) {
                groups.push({
                    sys_id: groupGr.getValue('sys_id'),
                    name: groupGr.getValue('name'),
                    description: groupGr.getValue('description'),
                    memberCount: this._getGroupMemberCount(groupGr.getValue('sys_id'))
                });
            }
        }
        
        return groups;
    },
    
    _getAllowedGroupIds: function() {
        var groupsStr = gs.getProperty('x_902080_planningw.session.creation.allowed.groups', '');
        if (!groupsStr) return [];
        return groupsStr.split(',');
    },
    
    _setAllowedGroups: function(groupIds) {
        var groupsStr = groupIds.join(',');
        gs.setProperty('x_902080_planningw.session.creation.allowed.groups', groupsStr);
    },
    
    _getGroupMemberCount: function(groupId) {
        var memberGr = new GlideRecord('sys_user_grmember');
        memberGr.addQuery('group', groupId);
        memberGr.query();
        return memberGr.getRowCount();
    },
    
    _getPermissionStats: function() {
        // Count users who can create sessions
        var totalUsers = 0;
        var usersWithPermission = 0;
        
        var userGr = new GlideRecord('sys_user');
        userGr.addQuery('active', true);
        userGr.query();
        
        while (userGr.next()) {
            totalUsers++;
            var userId = userGr.getValue('sys_id');
            
            if (this._testUserCanCreateSessions(userId)) {
                usersWithPermission++;
            }
        }
        
        return {
            totalUsers: totalUsers,
            usersWithPermission: usersWithPermission,
            restrictionRate: totalUsers > 0 ? Math.round(((totalUsers - usersWithPermission) / totalUsers) * 100) : 0
        };
    },
    
    _testUserCanCreateSessions: function(userId) {
        // Check if restricted mode is enabled
        var restrictedMode = gs.getProperty('x_902080_planningw.session.creation.restricted', 'false') === 'true';
        
        if (!restrictedMode) {
            // If not restricted, check for any qualifying roles
            return this._userHasAppRoles(userId) || this._userHasLegacyRoles(userId);
        } else {
            // If restricted, must be in allowed groups AND have roles
            var hasRoles = this._userHasAppRoles(userId) || this._userHasLegacyRoles(userId);
            var inAllowedGroups = this._userInAllowedGroups(userId);
            return hasRoles && inAllowedGroups;
        }
    },
    
    _userHasAppRoles: function(userId) {
        var userRoleGr = new GlideRecord('sys_user_has_role');
        userRoleGr.addQuery('user', userId);
        userRoleGr.addQuery('role.name', 'IN', 'x_902080_planningw.admin,x_902080_planningw.dealer,x_902080_planningw.facilitator');
        userRoleGr.query();
        return userRoleGr.hasNext();
    },
    
    _userHasLegacyRoles: function(userId) {
        var userRoleGr = new GlideRecord('sys_user_has_role');
        userRoleGr.addQuery('user', userId);
        userRoleGr.addQuery('role.name', 'IN', 'admin,itil');
        userRoleGr.query();
        return userRoleGr.hasNext();
    },
    
    _userInAllowedGroups: function(userId) {
        var allowedGroupIds = this._getAllowedGroupIds();
        if (allowedGroupIds.length === 0) return true; // No restriction if no groups specified
        
        var memberGr = new GlideRecord('sys_user_grmember');
        memberGr.addQuery('user', userId);
        memberGr.addQuery('group', 'IN', allowedGroupIds.join(','));
        memberGr.query();
        return memberGr.hasNext();
    },
    
    _getUserAllowedGroups: function(userId) {
        var allowedGroupIds = this._getAllowedGroupIds();
        var userGroups = [];
        
        var memberGr = new GlideRecord('sys_user_grmember');
        memberGr.addQuery('user', userId);
        memberGr.addQuery('group', 'IN', allowedGroupIds.join(','));
        memberGr.query();
        
        while (memberGr.next()) {
            var groupGr = new GlideRecord('sys_user_group');
            if (groupGr.get(memberGr.getValue('group'))) {
                userGroups.push(groupGr.getValue('name'));
            }
        }
        
        return userGroups;
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

    type: 'PermissionsAdminAjax'
});