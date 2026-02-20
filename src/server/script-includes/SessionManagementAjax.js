var SessionManagementAjax = Class.create();
SessionManagementAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    getScoringMethods: function() {
        try {
            var methods = [];
            var methodGr = new GlideRecord('x_902080_planningw_scoring_method');
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
            var sessionName = this.getParameter('session_name');
            var description = this.getParameter('description') || '';
            var scoringMethodId = this.getParameter('scoring_method');
            var dealerGroupId = this.getParameter('dealer_group');
            var allowSpectators = this.getParameter('allow_spectators') == 'true';
            var easyMode = this.getParameter('easy_mode') == 'true';
            
            if (!sessionName || !scoringMethodId) {
                return this._buildResponse(false, 'Session name and scoring method required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permission to create sessions
            if (!this.canCreateSession()) {
                return this._buildResponse(false, 'You do not have permission to create sessions', null);
            }
            
            // Generate unique session code
            var sessionCode = this._generateSessionCode();
            
            // Create session
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
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
            
            if (dealerGroupId) {
                sessionGr.setValue('dealer_group', dealerGroupId);
            }
            
            var sessionId = sessionGr.insert();
            
            if (sessionId) {
                // Create dealer participant record
                var participantGr = new GlideRecord('x_902080_planningw_session_participant');
                participantGr.initialize();
                participantGr.setValue('session', sessionId);
                participantGr.setValue('user', userId);
                participantGr.setValue('role', 'dealer');
                participantGr.setValue('status', 'active');
                participantGr.setValue('joined_at', new GlideDateTime());
                participantGr.setValue('is_presenter', true);
                participantGr.setValue('is_online', true);
                participantGr.insert();
                
                // Auto-add dealer group members
                if (dealerGroupId) {
                    this._addDealerGroupMembers(sessionId, dealerGroupId, userId);
                }
                
                gs.info('[SessionManagementAjax] Created session: ' + sessionId);
                
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
            
            var sessions = [];
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            
            // Build query for user's sessions
            var qc = sessionGr.addQuery('dealer', userId);
            qc.addOrCondition('facilitator', userId);
            
            // Check dealer group membership
            var userGroupGr = new GlideRecord('sys_user_grmember');
            userGroupGr.addQuery('user', userId);
            userGroupGr.query();
            
            while (userGroupGr.next()) {
                var groupId = userGroupGr.getValue('group');
                qc.addOrCondition('dealer_group', groupId);
            }
            
            // Filter by status if specified
            if (status !== 'all') {
                sessionGr.addQuery('status', status);
            }
            
            sessionGr.orderByDesc('sys_created_on');
            sessionGr.query();
            
            while (sessionGr.next()) {
                // Get participant counts
                var participantCounts = this._getParticipantCounts(sessionGr.getValue('sys_id'));
                
                sessions.push({
                    sys_id: sessionGr.getValue('sys_id'),
                    name: sessionGr.getValue('name'),
                    description: sessionGr.getValue('description'),
                    status: sessionGr.getValue('status'),
                    sessionCode: sessionGr.getValue('session_code'),
                    createdOn: sessionGr.getValue('sys_created_on'),
                    totalStories: sessionGr.getValue('total_stories') || 0,
                    storiesCompleted: sessionGr.getValue('stories_completed') || 0,
                    dealerCounts: participantCounts.dealers,
                    voterCounts: participantCounts.voters,
                    spectatorCounts: participantCounts.spectators,
                    easyMode: sessionGr.getValue('easy_mode') == 'true',
                    allowSpectators: sessionGr.getValue('allow_spectators') == 'true'
                });
            }
            
            return this._buildResponse(true, 'Sessions retrieved', sessions);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] getMySessions error: ' + e);
            return this._buildResponse(false, 'Error retrieving sessions: ' + e, null);
        }
    },
    
    getSessionDetails: function() {
        try {
            var sessionId = this.getParameter('session_id');
            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Get session
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            // Check permissions
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            // Get session stories
            var stories = [];
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            storyGr.addQuery('session', sessionId);
            storyGr.orderBy('order');
            storyGr.query();
            
            while (storyGr.next()) {
                stories.push({
                    sys_id: storyGr.getValue('sys_id'),
                    story_number: storyGr.getValue('story_number'),
                    story_title: storyGr.getValue('story_title'),
                    status: storyGr.getValue('status'),
                    story_points: storyGr.getValue('story_points'),
                    presenter: storyGr.getValue('presenter'),
                    vote_count: storyGr.getValue('vote_count') || 0
                });
            }
            
            var sessionData = {
                sys_id: sessionGr.getValue('sys_id'),
                name: sessionGr.getValue('name'),
                description: sessionGr.getValue('description'),
                status: sessionGr.getValue('status'),
                sessionCode: sessionGr.getValue('session_code'),
                scoringMethod: sessionGr.getValue('scoring_method'),
                dealerGroup: sessionGr.getValue('dealer_group'),
                allowSpectators: sessionGr.getValue('allow_spectators') == 'true',
                easyMode: sessionGr.getValue('easy_mode') == 'true',
                stories: stories
            };
            
            return this._buildResponse(true, 'Session details retrieved', sessionData);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] getSessionDetails error: ' + e);
            return this._buildResponse(false, 'Error retrieving session details: ' + e, null);
        }
    },
    
    addStories: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var storyIds = this.getParameter('story_ids'); // Comma-separated
            
            if (!sessionId || !storyIds) {
                return this._buildResponse(false, 'Session ID and story IDs required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            var storyIdArray = storyIds.split(',');
            var addedCount = 0;
            var skippedCount = 0;
            
            // Get current max order
            var maxOrderGr = new GlideRecord('x_902080_planningw_session_stories');
            maxOrderGr.addQuery('session', sessionId);
            maxOrderGr.orderByDesc('order');
            maxOrderGr.setLimit(1);
            maxOrderGr.query();
            
            var nextOrder = 1;
            if (maxOrderGr.next()) {
                nextOrder = parseInt(maxOrderGr.getValue('order') || '0', 10) + 1;
            }
            
            for (var i = 0; i < storyIdArray.length; i++) {
                var storyId = storyIdArray[i].trim();
                if (!storyId) continue;
                
                // Check if story can be reused
                if (this._canReuseStory(storyId)) {
                    var rmStoryGr = new GlideRecord('rm_story');
                    if (rmStoryGr.get(storyId)) {
                        // Create session story
                        var sessionStoryGr = new GlideRecord('x_902080_planningw_session_stories');
                        sessionStoryGr.initialize();
                        sessionStoryGr.setValue('session', sessionId);
                        sessionStoryGr.setValue('story', storyId);
                        sessionStoryGr.setValue('story_number', rmStoryGr.getValue('number'));
                        sessionStoryGr.setValue('story_title', rmStoryGr.getValue('short_description'));
                        sessionStoryGr.setValue('story_description', rmStoryGr.getValue('description'));
                        sessionStoryGr.setValue('acceptance_criteria', rmStoryGr.getValue('acceptance_criteria'));
                        sessionStoryGr.setValue('status', 'pending');
                        sessionStoryGr.setValue('order', nextOrder);
                        sessionStoryGr.setValue('vote_count', 0);
                        sessionStoryGr.setValue('times_revoted', 0);
                        sessionStoryGr.insert();
                        
                        addedCount++;
                        nextOrder++;
                    }
                } else {
                    skippedCount++;
                }
            }
            
            return this._buildResponse(true, 'Added ' + addedCount + ' stories, skipped ' + skippedCount, {
                addedCount: addedCount,
                skippedCount: skippedCount
            });
            
        } catch (e) {
            gs.error('[SessionManagementAjax] addStories error: ' + e);
            return this._buildResponse(false, 'Error adding stories: ' + e, null);
        }
    },
    
    removeStory: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var sessionStoryId = this.getParameter('session_story_id');
            
            if (!sessionId || !sessionStoryId) {
                return this._buildResponse(false, 'Session ID and session story ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            // Remove story and its votes
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (storyGr.get(sessionStoryId)) {
                // Delete votes first
                var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
                voteGr.addQuery('story', sessionStoryId);
                voteGr.deleteMultiple();
                
                // Delete session story
                storyGr.deleteRecord();
                
                return this._buildResponse(true, 'Story removed successfully', null);
            } else {
                return this._buildResponse(false, 'Story not found', null);
            }
            
        } catch (e) {
            gs.error('[SessionManagementAjax] removeStory error: ' + e);
            return this._buildResponse(false, 'Error removing story: ' + e, null);
        }
    },
    
    searchStories: function() {
        try {
            var searchTerm = this.getParameter('search_term');
            var limit = parseInt(this.getParameter('limit') || '20', 10);
            
            if (!searchTerm || searchTerm.length < 2) {
                return this._buildResponse(true, 'Stories retrieved', []);
            }
            
            var stories = [];
            var storyGr = new GlideRecord('rm_story');
            
            var qc = storyGr.addQuery('short_description', 'CONTAINS', searchTerm);
            qc.addOrCondition('number', 'CONTAINS', searchTerm);
            qc.addOrCondition('description', 'CONTAINS', searchTerm);
            
            storyGr.addQuery('active', true);
            storyGr.orderByDesc('sys_created_on');
            storyGr.setLimit(limit);
            storyGr.query();
            
            while (storyGr.next()) {
                stories.push({
                    sys_id: storyGr.getValue('sys_id'),
                    number: storyGr.getValue('number'),
                    short_description: storyGr.getValue('short_description'),
                    description: storyGr.getValue('description'),
                    story_points: storyGr.getValue('story_points'),
                    canReuse: this._canReuseStory(storyGr.getValue('sys_id'))
                });
            }
            
            return this._buildResponse(true, 'Stories retrieved', stories);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] searchStories error: ' + e);
            return this._buildResponse(false, 'Error searching stories: ' + e, null);
        }
    },
    
    goLiveSession: function() {
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
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            if (sessionGr.getValue('status') !== 'ready') {
                return this._buildResponse(false, 'Session must be in ready status to go live', null);
            }
            
            // Update session status
            sessionGr.setValue('status', 'live');
            sessionGr.update();
            
            return this._buildResponse(true, 'Session is now live', null);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] goLiveSession error: ' + e);
            return this._buildResponse(false, 'Error going live: ' + e, null);
        }
    },
    
    cancelSession: function() {
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
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            // Update session status
            sessionGr.setValue('status', 'cancelled');
            sessionGr.setValue('active', false);
            sessionGr.update();
            
            return this._buildResponse(true, 'Session cancelled', null);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] cancelSession error: ' + e);
            return this._buildResponse(false, 'Error cancelling session: ' + e, null);
        }
    },
    
    addManualStory: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var title = this.getParameter('title');
            var description = this.getParameter('description') || '';
            
            if (!sessionId || !title) {
                return this._buildResponse(false, 'Session ID and title required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions and easy mode
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            if (sessionGr.getValue('easy_mode') != 'true') {
                return this._buildResponse(false, 'Easy mode must be enabled to add manual stories', null);
            }
            
            // Get next order
            var maxOrderGr = new GlideRecord('x_902080_planningw_session_stories');
            maxOrderGr.addQuery('session', sessionId);
            maxOrderGr.orderByDesc('order');
            maxOrderGr.setLimit(1);
            maxOrderGr.query();
            
            var nextOrder = 1;
            if (maxOrderGr.next()) {
                nextOrder = parseInt(maxOrderGr.getValue('order') || '0', 10) + 1;
            }
            
            // Create session story
            var sessionStoryGr = new GlideRecord('x_902080_planningw_session_stories');
            sessionStoryGr.initialize();
            sessionStoryGr.setValue('session', sessionId);
            sessionStoryGr.setValue('story_number', 'MANUAL-' + nextOrder);
            sessionStoryGr.setValue('story_title', title);
            sessionStoryGr.setValue('story_description', description);
            sessionStoryGr.setValue('status', 'pending');
            sessionStoryGr.setValue('order', nextOrder);
            sessionStoryGr.setValue('vote_count', 0);
            sessionStoryGr.setValue('times_revoted', 0);
            var storyId = sessionStoryGr.insert();
            
            return this._buildResponse(true, 'Manual story added successfully', {
                storyId: storyId
            });
            
        } catch (e) {
            gs.error('[SessionManagementAjax] addManualStory error: ' + e);
            return this._buildResponse(false, 'Error adding manual story: ' + e, null);
        }
    },
    
    canCreateSession: function() {
        try {
            var userId = gs.getUserID();
            
            // Check if user has planning poker roles
            if (gs.hasRole('x_902080_planningw.admin') || gs.hasRole('x_902080_planningw.dealer') || gs.hasRole('x_902080_planningw.facilitator')) {
                return this._buildResponse(true, 'User can create sessions', true);
            }
            
            // Check legacy roles
            if (gs.hasRole('admin') || gs.hasRole('itil')) {
                return this._buildResponse(true, 'User can create sessions', true);
            }
            
            return this._buildResponse(true, 'User cannot create sessions', false);
            
        } catch (e) {
            gs.error('[SessionManagementAjax] canCreateSession error: ' + e);
            return this._buildResponse(false, 'Error checking permissions: ' + e, false);
        }
    },
    
    // Helper methods
    _generateSessionCode: function() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var code = '';
        for (var i = 0; i < 3; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        code += '-';
        for (var j = 0; j < 4; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Ensure uniqueness
        var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
        sessionGr.addQuery('session_code', code);
        sessionGr.query();
        
        if (sessionGr.hasNext()) {
            return this._generateSessionCode(); // Recursive retry
        }
        
        return code;
    },
    
    _addDealerGroupMembers: function(sessionId, dealerGroupId, excludeUserId) {
        var groupMemberGr = new GlideRecord('sys_user_grmember');
        groupMemberGr.addQuery('group', dealerGroupId);
        groupMemberGr.query();
        
        while (groupMemberGr.next()) {
            var memberId = groupMemberGr.getValue('user');
            if (memberId === excludeUserId) continue; // Skip creator, already added
            
            // Check if already participant
            var existingGr = new GlideRecord('x_902080_planningw_session_participant');
            existingGr.addQuery('session', sessionId);
            existingGr.addQuery('user', memberId);
            existingGr.query();
            
            if (!existingGr.hasNext()) {
                var participantGr = new GlideRecord('x_902080_planningw_session_participant');
                participantGr.initialize();
                participantGr.setValue('session', sessionId);
                participantGr.setValue('user', memberId);
                participantGr.setValue('role', 'dealer');
                participantGr.setValue('status', 'active');
                participantGr.setValue('joined_at', new GlideDateTime());
                participantGr.setValue('is_online', false);
                participantGr.insert();
            }
        }
    },
    
    _getParticipantCounts: function(sessionId) {
        var counts = { dealers: 0, voters: 0, spectators: 0 };
        
        var partGr = new GlideRecord('x_902080_planningw_session_participant');
        partGr.addQuery('session', sessionId);
        partGr.addQuery('status', 'active');
        partGr.query();
        
        while (partGr.next()) {
            var role = partGr.getValue('role');
            if (role === 'dealer') {
                counts.dealers++;
            } else if (role === 'voter') {
                counts.voters++;
            } else if (role === 'spectator') {
                counts.spectators++;
            }
        }
        
        return counts;
    },
    
    _canReuseStory: function(storyId) {
        // Check if story can be reused (not in active session with votes)
        var sessionStoryGr = new GlideRecord('x_902080_planningw_session_stories');
        sessionStoryGr.addQuery('story', storyId);
        sessionStoryGr.query();
        
        while (sessionStoryGr.next()) {
            var sessionId = sessionStoryGr.getValue('session');
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            
            if (sessionGr.get(sessionId)) {
                var sessionStatus = sessionGr.getValue('status');
                
                // If session is active (ready/live), check vote status
                if (sessionStatus === 'ready' || sessionStatus === 'live') {
                    var voteCount = parseInt(sessionStoryGr.getValue('vote_count') || '0', 10);
                    var storyStatus = sessionStoryGr.getValue('status');
                    
                    // Block if has votes or not skipped
                    if (voteCount > 0 && storyStatus !== 'skipped') {
                        return false;
                    }
                }
            }
        }
        
        return true;
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