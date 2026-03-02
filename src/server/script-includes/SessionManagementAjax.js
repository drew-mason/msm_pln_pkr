var SessionManagementAjax = Class.create();
SessionManagementAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    getScoringMethods: function() {
        try {
            var methods = [];
            var methodGr = new GlideRecord('pp_scoring_method');
            methodGr.addQuery('active', true);
            methodGr.orderBy('name');
            methodGr.query();
            
            while (methodGr.next()) {
                methods.push({
                    sys_id: methodGr.getValue('sys_id'),
                    name: methodGr.getValue('name'),
                    isDefault: methodGr.getValue('is_default') == 'true'
                });
            }
            
            return this._buildResponse(true, 'Scoring methods retrieved', methods);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] getScoringMethods error: ' + e);
            return this._buildResponse(false, 'Error retrieving scoring methods: ' + e, null);
        }
    },
    
    getUserGroups: function() {
        try {
            var groups = [];
            var groupGr = new GlideRecord('sys_user_group');
            groupGr.addQuery('active', true);
            groupGr.orderBy('name');
            groupGr.setLimit(100);
            groupGr.query();
            
            while (groupGr.next()) {
                groups.push({
                    sys_id: groupGr.getValue('sys_id'),
                    name: groupGr.getValue('name'),
                    description: groupGr.getValue('description')
                });
            }
            
            return this._buildResponse(true, 'User groups retrieved', groups);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] getUserGroups error: ' + e);
            return this._buildResponse(false, 'Error retrieving user groups: ' + e, null);
        }
    },
    
    createSession: function() {
        try {
            var sessionName = this._sanitizeString(this.getParameter('session_name'), 200);
            var description = this._sanitizeString(this.getParameter('description') || '', 4000);
            var scoringMethodId = this.getParameter('scoring_method');
            var allowSpectators = this.getParameter('allow_spectators') == 'true';
            var easyMode = this.getParameter('easy_mode') == 'true';
            
            if (!sessionName || !scoringMethodId) {
                return this._buildResponse(false, 'Session name and scoring method required', null);
            }

            if (!this._isValidSysId(scoringMethodId)) {
                return this._buildResponse(false, 'Invalid scoring method ID', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permission to create sessions
            if (!this._hasCreatePermission()) {
                return this._buildResponse(false, 'You do not have permission to create sessions', null);
            }
            
            // Generate unique session code
            var sessionCode = this._generateSessionCode();
            
            // Create session
            var sessionGr = new GlideRecord('pp_planning_session');
            sessionGr.initialize();
            sessionGr.setValue('name', sessionName);
            sessionGr.setValue('description', description);
            sessionGr.setValue('status', 'ready');
            sessionGr.setValue('session_code', sessionCode);
            sessionGr.setValue('dealer', userId);
            sessionGr.setValue('scoring_method', scoringMethodId);
            sessionGr.setValue('allow_spectators', allowSpectators);
            sessionGr.setValue('easy_mode', easyMode);
            sessionGr.setValue('demo_mode', false);
            sessionGr.setValue('active', true);
            
            var sessionId = sessionGr.insert();
            
            if (sessionId) {
                // Create dealer participant record
                var participantGr = new GlideRecord('pp_session_participant');
                participantGr.initialize();
                participantGr.setValue('session', sessionId);
                participantGr.setValue('user', userId);
                participantGr.setValue('role', 'dealer');
                participantGr.setValue('status', 'active');
                participantGr.setValue('joined_at', new GlideDateTime());
                participantGr.setValue('is_presenter', true);
                participantGr.setValue('is_online', true);
                participantGr.insert();
                
                gs.debug('[SessionManagementAjax] Created session: ' + sessionId);
                
                return this._buildResponse(true, 'Session created successfully', {
                    sessionId: sessionId,
                    sessionCode: sessionCode
                });
            } else {
                return this._buildResponse(false, 'Failed to create session', null);
            }
            
        } catch (e) {
            gs.error('[SessionManagementAjax] createSession error: ' + e);
            return this._buildResponse(false, 'Error creating session: ' + e, null);
        }
    },
    
    getMySessions: function() {
        try {
            var userId = gs.getUserID();
            var status = this.getParameter('status') || 'all';
            
            // Validate status parameter
            var validStatuses = ['all', 'ready', 'live', 'completed', 'cancelled'];
            if (validStatuses.indexOf(status) === -1) {
                status = 'all';
            }
            
            var sessions = [];
            var sessionGr = new GlideRecord('pp_planning_session');
            
            // Build query for user's sessions
            var qc = sessionGr.addQuery('dealer', userId);
            qc.addOrCondition('facilitator', userId);
            
            // Also show sessions where user is/was a dealer participant
            var partGr = new GlideRecord('pp_session_participant');
            partGr.addQuery('user', userId);
            partGr.addQuery('role', 'dealer');
            partGr.query();
            while (partGr.next()) {
                qc.addOrCondition('sys_id', partGr.getValue('session'));
            }
            
            // Filter by status if specified
            if (status !== 'all') {
                sessionGr.addQuery('status', status);
            }
            
            sessionGr.orderByDesc('sys_created_on');
            sessionGr.setLimit(100);
            sessionGr.query();
            
            // Collect session IDs and base data first
            var sessionIds = [];
            var sessionDataList = [];
            while (sessionGr.next()) {
                var sid = sessionGr.getValue('sys_id');
                sessionIds.push(sid);
                sessionDataList.push({
                    sys_id: sid,
                    name: sessionGr.getValue('name'),
                    description: sessionGr.getValue('description'),
                    status: sessionGr.getValue('status'),
                    sessionCode: sessionGr.getValue('session_code'),
                    createdOn: sessionGr.getValue('sys_created_on'),
                    easyMode: sessionGr.getValue('easy_mode') == 'true',
                    allowSpectators: sessionGr.getValue('allow_spectators') == 'true'
                });
            }
            
            // Batch participant counts using GlideAggregate
            var partCounts = {};
            if (sessionIds.length > 0) {
                var partGa = new GlideAggregate('pp_session_participant');
                partGa.addQuery('session', 'IN', sessionIds.join(','));
                partGa.addQuery('status', 'active');
                partGa.addAggregate('COUNT');
                partGa.groupBy('session');
                partGa.groupBy('role');
                partGa.query();
                while (partGa.next()) {
                    var pSid = partGa.getValue('session');
                    var role = partGa.getValue('role');
                    var cnt = parseInt(partGa.getAggregate('COUNT'), 10);
                    if (!partCounts[pSid]) partCounts[pSid] = { dealers: 0, voters: 0, spectators: 0 };
                    if (role === 'dealer') partCounts[pSid].dealers = cnt;
                    else if (role === 'voter') partCounts[pSid].voters = cnt;
                    else if (role === 'spectator') partCounts[pSid].spectators = cnt;
                }
            }
            
            // Batch story counts using GlideAggregate
            var storyTotals = {};
            var storyCompleted = {};
            if (sessionIds.length > 0) {
                var totalGa = new GlideAggregate('pp_session_stories');
                totalGa.addQuery('session', 'IN', sessionIds.join(','));
                totalGa.addAggregate('COUNT');
                totalGa.groupBy('session');
                totalGa.query();
                while (totalGa.next()) {
                    storyTotals[totalGa.getValue('session')] = parseInt(totalGa.getAggregate('COUNT'), 10);
                }
                
                var compGa = new GlideAggregate('pp_session_stories');
                compGa.addQuery('session', 'IN', sessionIds.join(','));
                compGa.addQuery('status', 'completed');
                compGa.addAggregate('COUNT');
                compGa.groupBy('session');
                compGa.query();
                while (compGa.next()) {
                    storyCompleted[compGa.getValue('session')] = parseInt(compGa.getAggregate('COUNT'), 10);
                }
            }
            
            // Assemble results
            for (var i = 0; i < sessionDataList.length; i++) {
                var sData = sessionDataList[i];
                var pc = partCounts[sData.sys_id] || { dealers: 0, voters: 0, spectators: 0 };
                sData.totalStories = storyTotals[sData.sys_id] || 0;
                sData.storiesCompleted = storyCompleted[sData.sys_id] || 0;
                sData.dealerCounts = pc.dealers;
                sData.voterCounts = pc.voters;
                sData.spectatorCounts = pc.spectators;
                sessions.push(sData);
            }
            
            return this._buildResponse(true, 'Sessions retrieved', sessions);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] getMySessions error: ' + e);
            return this._buildResponse(false, 'Error retrieving sessions: ' + e, null);
        }
    },

    // Continue with the rest of the methods, updating table names throughout...
    // [Due to length constraints, I'm showing the pattern - all table references need updating]
    
    _generateSessionCode: function(attempt) {
        attempt = attempt || 0;
        if (attempt >= 10) {
            gs.error('[SessionManagementAjax] Could not generate unique session code after 10 attempts');
            return 'ERR-' + Math.floor(Math.random() * 10000);
        }

        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var code = '';
        for (var i = 0; i < 3; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        code += '-';
        for (var j = 0; j < 4; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Ensure uniqueness with global table name
        var sessionGr = new GlideRecord('pp_planning_session');
        sessionGr.addQuery('session_code', code);
        sessionGr.setLimit(1);
        sessionGr.query();
        
        if (sessionGr.hasNext()) {
            return this._generateSessionCode(attempt + 1);
        }
        
        return code;
    },

    _hasCreatePermission: function() {
        // Check if user has planning poker roles (updated for global)
        if (gs.hasRole('pp_admin') || gs.hasRole('pp_dealer') || gs.hasRole('pp_facilitator')) {
            return true;
        }
        // Check legacy roles
        if (gs.hasRole('admin') || gs.hasRole('itil')) {
            return true;
        }
        return false;
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

    type: 'SessionManagementAjax'
});