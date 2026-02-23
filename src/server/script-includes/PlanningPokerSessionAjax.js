var PlanningPokerSessionAjax = Class.create();
PlanningPokerSessionAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    getSession: function() {
        try {
            gs.debug('[PlanningPokerSessionAjax] getSession called');
            
            var validation = this._validateAndLoadSession();
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
            }
            
            var sessionGr = validation.sessionGr;
            var sessionId = sessionGr.getValue('sys_id');
            var userId = gs.getUserID();
            
            // Update heartbeat and clean up stale participants
            this._updateHeartbeat(sessionId);
            this._cleanupStaleParticipants(sessionId);
            
            // Build session data
            var data = {
                session: this._buildSessionInfo(sessionGr),
                currentStory: this._getCurrentStory(sessionId),
                storyQueue: this._getStoryQueue(sessionId),
                participants: this._getParticipants(sessionId, null, sessionGr),
                scoringValues: this._getScoringValues(sessionGr.getValue('scoring_method')),
                userRole: this._getUserRoleData(sessionId, userId, sessionGr),
                revealedVotes: null
            };
            
            // If story is revealed, get votes and statistics
            if (data.currentStory && data.currentStory.status === PlanningPokerConstants.STATUS.REVEALED) {
                data.revealedVotes = this._getRevealedVotes(data.currentStory.sys_id);
            }
            
            return this._buildResponse(true, 'Session retrieved', data);
            
        } catch (e) {
            gs.error('[PlanningPokerSessionAjax] getSession error: ' + e);
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    getVotingStatus: function() {
        try {
            var validation = this._validateAndLoadSession();
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
            }
            
            var sessionGr = validation.sessionGr;
            var sessionId = sessionGr.getValue('sys_id');
            
            // Update heartbeat for current user and clean up stale participants
            this._updateHeartbeat(sessionId);
            this._cleanupStaleParticipants(sessionId);
            
            var currentStory = this._getCurrentStory(sessionId);
            if (!currentStory) {
                return this._buildResponse(true, 'No current story', { 
                    hasCurrentStory: false,
                    sessionStatus: sessionGr.getValue('status'),
                    participants: this._getParticipants(sessionId, null, sessionGr)
                });
            }
            
            // Get voting indicators without revealing values
            var participants = this._getParticipants(sessionId, currentStory.sys_id, sessionGr);
            var totalVoteCount = this._getTotalVoteCount(currentStory.sys_id);
            
            var data = {
                hasCurrentStory: true,
                storyId: currentStory.sys_id,
                storyStatus: currentStory.status,
                storyTitle: currentStory.story_title,
                storyDescription: currentStory.story_description,
                acceptanceCriteria: currentStory.acceptance_criteria,
                dealerComments: currentStory.dealer_comments,
                sessionStatus: sessionGr.getValue('status'),
                participants: participants,
                totalVoteCount: totalVoteCount
            };
            
            return this._buildResponse(true, 'Voting status retrieved', data);
            
        } catch (e) {
            gs.error('[PlanningPokerSessionAjax] getVotingStatus error: ' + e);
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    // Internal helper methods
    _validateAndLoadSession: function() {
        var sessionId = this.getParameter('session_id');
        if (!sessionId) {
            return { isValid: false, message: PlanningPokerConstants.ERRORS.SESSION_ID_REQUIRED };
        }

        if (!/^[0-9a-f]{32}$/i.test(sessionId)) {
            return { isValid: false, message: PlanningPokerConstants.ERRORS.INVALID_SESSION_FORMAT };
        }
        
        var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
        if (!sessionGr.get(sessionId)) {
            return { isValid: false, message: PlanningPokerConstants.ERRORS.SESSION_NOT_FOUND };
        }
        
        var userId = gs.getUserID();
        var security = new PlanningPokerSecurity();
        if (!security.canAccessSession(sessionId, userId)) {
            return { isValid: false, message: PlanningPokerConstants.ERRORS.ACCESS_DENIED };
        }
        
        return { isValid: true, sessionGr: sessionGr };
    },

    _getCurrentStory: function(sessionId) {
        var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
        if (!sessionGr.get(sessionId)) {
            return null;
        }
        
        var currentStoryId = sessionGr.getValue('current_story');
        if (!currentStoryId) {
            return null;
        }
        
        var storyGr = new GlideRecord('x_902080_planningw_session_stories');
        if (!storyGr.get(currentStoryId)) {
            return null;
        }
        
        var storyData = {
            sys_id: storyGr.getValue('sys_id'),
            story_number: storyGr.getValue('story_number'),
            story_title: storyGr.getValue('story_title'),
            story_description: storyGr.getValue('story_description'),
            acceptance_criteria: storyGr.getValue('acceptance_criteria'),
            status: storyGr.getValue('status'),
            order: storyGr.getValue('order'),
            story_points: storyGr.getValue('story_points'),
            presenter: storyGr.getValue('presenter'),
            dealer_comments: storyGr.getValue('dealer_comments'),
            story_ref: storyGr.getValue('story')
        };
        
        // Try to read from rm_story if reference exists
        var rmStoryId = storyGr.getValue('story');
        if (rmStoryId) {
            var rmStoryGr = new GlideRecord('rm_story');
            if (rmStoryGr.get(rmStoryId)) {
                // Only override if the session story fields are empty/default
                if (!storyData.story_title) storyData.story_title = rmStoryGr.getValue('short_description');
                if (!storyData.story_description) storyData.story_description = rmStoryGr.getValue('description');
                if (!storyData.acceptance_criteria) storyData.acceptance_criteria = rmStoryGr.getValue('acceptance_criteria');
                if (!storyData.story_number) storyData.story_number = rmStoryGr.getValue('number');
            }
        }
        
        return storyData;
    },
    
    _getParticipants: function(sessionId, storyId, sessionGr) {
        var participants = [];
        
        // Pre-load voters for the current story in one query
        var voterSet = {};
        if (storyId) {
            var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
            voteGr.addQuery('story', storyId);
            voteGr.query();
            while (voteGr.next()) {
                voterSet[voteGr.getValue('voter')] = true;
            }
        }
        
        // Pre-compute dealer permission set efficiently
        var dealerPermSet = this._buildDealerPermissionSet(sessionId, sessionGr);
        
        var partGr = new GlideRecord('x_902080_planningw_session_participant');
        partGr.addQuery('session', sessionId);
        partGr.addQuery('status', PlanningPokerConstants.STATUS.ACTIVE);
        partGr.addQuery('is_online', true);
        partGr.orderBy('role');
        partGr.orderBy('user.name');
        partGr.query();
        
        while (partGr.next()) {
            var userId = partGr.getValue('user');
            var rawRole = partGr.getValue('role');
            var role = rawRole;
            
            // Normalize role for client consumption (strip scope prefix if present)
            if (role === PlanningPokerConstants.ROLES.DEALER || (role && role.indexOf('dealer') > -1)) {
                role = 'dealer';
            } else if (role === PlanningPokerConstants.ROLES.VOTER || (role && role.indexOf('voter') > -1)) {
                role = 'voter';
            }
            
            // Detect bot participants by username convention
            var userName = partGr.user.user_name.toString();
            var isBot = userName.indexOf('ppbot_') === 0;
            
            participants.push({
                userId: userId,
                name: partGr.getDisplayValue('user'),
                firstName: partGr.user.first_name.toString(),
                lastName: partGr.user.last_name.toString(),
                role: role,
                isBot: isBot,
                isDealer: dealerPermSet[userId] === true,
                isPresenter: partGr.getValue('is_presenter') == 'true',
                isOnline: partGr.getValue('is_online') == 'true',
                hasVoted: storyId ? (voterSet[userId] === true) : false,
                joinedAt: partGr.getValue('joined_at')
            });
        }
        
        return participants;
    },
    
    // Build a set of user IDs that have dealer permission for this session
    _buildDealerPermissionSet: function(sessionId, sessionGr) {
        var dealerSet = {};
        
        if (!sessionGr) {
            sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) return dealerSet;
        }
        
        // Session creator (dealer field) always has permission
        var dealerId = sessionGr.getValue('dealer');
        if (dealerId) {
            dealerSet[dealerId] = true;
        }
        
        // Any participant with dealer role has permission (promoted dealers)
        var partGr = new GlideRecord('x_902080_planningw_session_participant');
        partGr.addQuery('session', sessionId);
        partGr.addQuery('status', PlanningPokerConstants.STATUS.ACTIVE);
        partGr.addQuery('is_online', true);
        partGr.addQuery('role', 'dealer');
        partGr.query();
        while (partGr.next()) {
            dealerSet[partGr.getValue('user')] = true;
        }
        
        // Admins have permission
        var security = new PlanningPokerSecurity();
        var allPartGr = new GlideRecord('x_902080_planningw_session_participant');
        allPartGr.addQuery('session', sessionId);
        allPartGr.addQuery('status', PlanningPokerConstants.STATUS.ACTIVE);
        allPartGr.query();
        while (allPartGr.next()) {
            var uid = allPartGr.getValue('user');
            if (!dealerSet[uid] && security.hasAdminAccess(uid)) {
                dealerSet[uid] = true;
            }
        }
        
        return dealerSet;
    },
    
    _getScoringValues: function(methodId) {
        if (!methodId) return [];
        
        // First try individual scoring_value records
        var values = [];
        var valueGr = new GlideRecord('x_902080_planningw_scoring_value');
        valueGr.addQuery('scoring_method', methodId);
        valueGr.orderBy('order');
        valueGr.query();
        
        while (valueGr.next()) {
            values.push({
                displayValue: valueGr.getValue('display_value'),
                numericValue: valueGr.getValue('numeric_value'),
                isSpecial: valueGr.getValue('is_special') == 'true'
            });
        }
        
        // Fallback: parse comma-separated values from the scoring method record
        if (values.length === 0) {
            var methodGr = new GlideRecord('x_902080_planningw_scoring_method');
            if (methodGr.get(methodId)) {
                var csvValues = methodGr.getValue('values');
                if (csvValues) {
                    var specialValues = ['?', 'Pass', 'PASS', 'Break', 'BREAK'];
                    var tshirtMap = PlanningPokerConstants.VOTE_VALUES.TSHIRT_MAP;
                    var parts = csvValues.split(',');
                    for (var i = 0; i < parts.length; i++) {
                        var val = parts[i].trim();
                        if (!val) continue;
                        var isSpecial = specialValues.indexOf(val) > -1;
                        var numericValue = null;
                        if (!isNaN(parseFloat(val)) && isFinite(val)) {
                            numericValue = parseFloat(val);
                        } else if (tshirtMap && tshirtMap.hasOwnProperty(val.toUpperCase())) {
                            numericValue = tshirtMap[val.toUpperCase()];
                        }
                        values.push({
                            displayValue: val,
                            numericValue: numericValue,
                            isSpecial: isSpecial
                        });
                    }
                }
            }
        }
        
        return values;
    },
    
    _getUserRoleData: function(sessionId, userId, sessionGr) {
        var security = new PlanningPokerSecurity();
        var roleData = security.getUserRole(sessionId, userId);
        
        var effectiveRole = roleData.role;
        // Normalize role for client consumption (strip scope prefix if present)
        var normalizedEffectiveRole = effectiveRole;
        if (effectiveRole === PlanningPokerConstants.ROLES.DEALER || (effectiveRole && effectiveRole.indexOf('dealer') > -1)) {
            normalizedEffectiveRole = 'dealer';
        } else if (effectiveRole === PlanningPokerConstants.ROLES.VOTER || (effectiveRole && effectiveRole.indexOf('voter') > -1)) {
            normalizedEffectiveRole = 'voter';
        }
        
        var isDealer = roleData.isDealer;
        var participantRole = roleData.participantRole;
        var isAdmin = security.hasAdminAccess(userId);
        
        // Logic for UI switching
        var canSwitchToVoter = isDealer && participantRole === PlanningPokerConstants.ROLES.DEALER;
        var canSwitchToDealer = isDealer && participantRole !== PlanningPokerConstants.ROLES.DEALER;
        
        // Find current active dealer name (for UI context)
        var activeDealerName = '';
        if (canSwitchToDealer) {
            var activeDealerGr = new GlideRecord('x_902080_planningw_session_participant');
            activeDealerGr.addQuery('session', sessionId);
            activeDealerGr.addQuery('role', PlanningPokerConstants.ROLES.DEALER);
            activeDealerGr.addQuery('status', PlanningPokerConstants.STATUS.ACTIVE);
            activeDealerGr.setLimit(1);
            activeDealerGr.query();
            if (activeDealerGr.next()) {
                var dealerUserGr = new GlideRecord('sys_user');
                if (dealerUserGr.get(activeDealerGr.getValue('user'))) {
                    activeDealerName = dealerUserGr.getValue('name');
                }
            }
        }
        
        return {
            userId: userId,
            effectiveRole: normalizedEffectiveRole,
            isDealer: isDealer,
            isAdmin: isAdmin,
            participantRole: participantRole,
            canSwitchToVoter: canSwitchToVoter,
            canSwitchToDealer: canSwitchToDealer,
            activeDealerName: activeDealerName
        };
    },
    
    _buildSessionInfo: function(sessionGr) {
        return {
            sys_id: sessionGr.getValue('sys_id'),
            name: sessionGr.getValue('name'),
            description: sessionGr.getValue('description'),
            status: sessionGr.getValue('status'),
            sessionCode: sessionGr.getValue('session_code'),
            dealer: sessionGr.getValue('dealer'),
            facilitator: sessionGr.getValue('facilitator'),
            activePresenter: sessionGr.getValue('active_presenter'),
            allowSpectators: sessionGr.getValue('allow_spectators') == 'true',
            easyMode: sessionGr.getValue('easy_mode') == 'true',
            demoMode: sessionGr.getValue('demo_mode') == 'true',
            totalStories: sessionGr.getValue('total_stories'),
            storiesVoted: sessionGr.getValue('stories_voted'),
            storiesCompleted: sessionGr.getValue('stories_completed'),
            storiesSkipped: sessionGr.getValue('stories_skipped'),
            totalVotes: sessionGr.getValue('total_votes')
        };
    },
    
    _getRevealedVotes: function(storyId) {
        var votes = [];
        var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
        voteGr.addQuery('story', storyId);
        voteGr.setLimit(200); // Cap votes per story
        voteGr.query();
        
        while (voteGr.next()) {
            var voterId = voteGr.getValue('voter');
            var voterName = voterId;
            var voterGr = new GlideRecord('sys_user');
            if (voterGr.get(voterId)) {
                voterName = voterGr.getValue('name');
            }
            votes.push({
                voter: voterId,
                voterName: voterName,
                vote_value: voteGr.getValue('vote_value'),
                vote_numeric_value: voteGr.getValue('vote_numeric_value'),
                vote_time: voteGr.getValue('vote_time')
            });
        }
        
        // Calculate statistics
        var voteUtils = new PlanningPokerVoteUtils();
        var summary = voteUtils.calculateVoteSummary(votes);
        
        return {
            votes: votes,
            summary: summary
        };
    },
    
    _getTotalVoteCount: function(storyId) {
        var voteGa = new GlideAggregate('x_902080_planningw_planning_vote');
        voteGa.addQuery('story', storyId);
        voteGa.addAggregate('COUNT');
        voteGa.query();
        if (voteGa.next()) {
            return parseInt(voteGa.getAggregate('COUNT'), 10);
        }
        return 0;
    },

    _getStoryQueue: function(sessionId) {
        var stories = [];
        var storyGr = new GlideRecord('x_902080_planningw_session_stories');
        storyGr.addQuery('session', sessionId);
        storyGr.orderBy('order');
        storyGr.setLimit(500); // Cap stories per session
        storyGr.query();

        // Collect added_by user IDs for batch lookup
        var userIds = [];
        var storyData = [];
        while (storyGr.next()) {
            var addedBy = storyGr.getValue('added_by') || '';
            storyData.push({
                sys_id: storyGr.getValue('sys_id'),
                story_number: storyGr.getValue('story_number'),
                story_title: storyGr.getValue('story_title'),
                status: storyGr.getValue('status'),
                order: storyGr.getValue('order'),
                story_points: storyGr.getValue('story_points'),
                vote_count: storyGr.getValue('vote_count') || 0,
                added_by: addedBy,
                added_by_name: ''
            });
            if (addedBy && userIds.indexOf(addedBy) === -1) {
                userIds.push(addedBy);
            }
        }

        // Batch lookup user names
        var userNames = {};
        if (userIds.length > 0) {
            var userGr = new GlideRecord('sys_user');
            userGr.addQuery('sys_id', 'IN', userIds.join(','));
            userGr.query();
            while (userGr.next()) {
                userNames[userGr.getValue('sys_id')] = userGr.getValue('name');
            }
        }

        // Populate names
        for (var i = 0; i < storyData.length; i++) {
            if (storyData[i].added_by && userNames[storyData[i].added_by]) {
                storyData[i].added_by_name = userNames[storyData[i].added_by];
            }
            stories.push(storyData[i]);
        }

        return stories;
    },
    
    // Update last_seen timestamp for the current user's participant record
    _updateHeartbeat: function(sessionId) {
        var userId = gs.getUserID();
        var partGr = new GlideRecord('x_902080_planningw_session_participant');
        partGr.addQuery('session', sessionId);
        partGr.addQuery('user', userId);
        partGr.addQuery('status', PlanningPokerConstants.STATUS.ACTIVE);
        partGr.setLimit(1);
        partGr.query();
        if (partGr.next()) {
            partGr.setValue('last_seen', new GlideDateTime());
            partGr.setValue('is_online', true);
            partGr.setWorkflow(false);
            partGr.update();
        }
    },
    
    // Mark participants as offline if they haven't polled in 15+ seconds
    _cleanupStaleParticipants: function(sessionId) {
        var cutoff = new GlideDateTime();
        cutoff.addSeconds(-15);
        
        var staleGr = new GlideRecord('x_902080_planningw_session_participant');
        staleGr.addQuery('session', sessionId);
        staleGr.addQuery('status', PlanningPokerConstants.STATUS.ACTIVE);
        staleGr.addQuery('is_online', true);
        staleGr.addQuery('last_seen', '<', cutoff);
        staleGr.query();
        while (staleGr.next()) {
            staleGr.setValue('is_online', false);
            staleGr.setWorkflow(false);
            staleGr.update();
        }
    },
    
    _buildResponse: function(success, message, data) {
        return JSON.stringify({
            success: success,
            message: message,
            data: data
        });
    },

    type: 'PlanningPokerSessionAjax'
});