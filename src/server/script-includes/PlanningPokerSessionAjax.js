var PlanningPokerSessionAjax = Class.create();
PlanningPokerSessionAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    getSession: function() {
        try {
            gs.info('[PlanningPokerSessionAjax] getSession called');
            
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
            
            // Check access
            var security = new PlanningPokerSecurity();
            if (!security.canAccessSession(sessionId, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            // Build session data
            var data = {
                session: this._buildSessionInfo(sessionGr),
                currentStory: this._getCurrentStory(sessionId),
                participants: this._getParticipants(sessionId),
                scoringValues: this._getScoringValues(sessionGr.getValue('scoring_method')),
                userRole: this._determineEffectiveRole(sessionId, userId, sessionGr),
                revealedVotes: null
            };
            
            // If story is revealed, get votes and statistics
            if (data.currentStory && data.currentStory.status === 'revealed') {
                data.revealedVotes = this._getRevealedVotes(data.currentStory.sys_id);
            }
            
            return this._buildResponse(true, 'Session retrieved', data);
            
        } catch (e) {
            gs.error('[PlanningPokerSessionAjax] getSession error: ' + e);
            return this._buildResponse(false, 'Error retrieving session: ' + e, null);
        }
    },
    
    getVotingStatus: function() {
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
            
            // Check access
            var security = new PlanningPokerSecurity();
            if (!security.canAccessSession(sessionId, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            var currentStory = this._getCurrentStory(sessionId);
            if (!currentStory) {
                return this._buildResponse(true, 'No current story', { 
                    hasCurrentStory: false,
                    sessionStatus: sessionGr.getValue('status')
                });
            }
            
            // Get voting indicators without revealing values
            var participants = this._getParticipants(sessionId, currentStory.sys_id);
            var totalVoteCount = this._getTotalVoteCount(currentStory.sys_id);
            
            var data = {
                hasCurrentStory: true,
                storyId: currentStory.sys_id,
                storyStatus: currentStory.status,
                sessionStatus: sessionGr.getValue('status'),
                participants: participants,
                totalVoteCount: totalVoteCount
            };
            
            return this._buildResponse(true, 'Voting status retrieved', data);
            
        } catch (e) {
            gs.error('[PlanningPokerSessionAjax] getVotingStatus error: ' + e);
            return this._buildResponse(false, 'Error retrieving voting status: ' + e, null);
        }
    },
    
    // Internal helper methods
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
            dealer_comments: storyGr.getValue('dealer_comments')
        };
        
        // Try to read from rm_story if reference exists
        var rmStoryId = storyGr.getValue('story');
        if (rmStoryId) {
            var rmStoryGr = new GlideRecord('rm_story');
            if (rmStoryGr.get(rmStoryId)) {
                storyData.story_title = rmStoryGr.getValue('short_description') || storyData.story_title;
                storyData.story_description = rmStoryGr.getValue('description') || storyData.story_description;
                storyData.acceptance_criteria = rmStoryGr.getValue('acceptance_criteria') || storyData.acceptance_criteria;
                storyData.story_number = rmStoryGr.getValue('number') || storyData.story_number;
            }
        }
        
        return storyData;
    },
    
    _getParticipants: function(sessionId, storyId) {
        var participants = [];
        
        var partGr = new GlideRecord('x_902080_planningw_session_participant');
        partGr.addQuery('session', sessionId);
        partGr.addQuery('status', 'active');
        partGr.orderBy('role');
        partGr.orderBy('user.name');
        partGr.query();
        
        while (partGr.next()) {
            var userId = partGr.getValue('user');
            var userGr = new GlideRecord('sys_user');
            if (userGr.get(userId)) {
                var hasVoted = false;
                
                // Check if user has voted on current story
                if (storyId) {
                    var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
                    voteGr.addQuery('story', storyId);
                    voteGr.addQuery('voter', userId);
                    voteGr.query();
                    hasVoted = voteGr.hasNext();
                }
                
                participants.push({
                    userId: userId,
                    name: userGr.getValue('name'),
                    firstName: userGr.getValue('first_name'),
                    lastName: userGr.getValue('last_name'),
                    role: partGr.getValue('role'),
                    isPresenter: partGr.getValue('is_presenter') == 'true',
                    isOnline: partGr.getValue('is_online') == 'true',
                    hasVoted: hasVoted,
                    joinedAt: partGr.getValue('joined_at')
                });
            }
        }
        
        return participants;
    },
    
    _getScoringValues: function(methodId) {
        if (!methodId) return [];
        
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
        
        return values;
    },
    
    _determineEffectiveRole: function(sessionId, userId, sessionGr) {
        // Get participant record role
        var partGr = new GlideRecord('x_902080_planningw_session_participant');
        partGr.addQuery('session', sessionId);
        partGr.addQuery('user', userId);
        partGr.query();
        
        var participantRole = null;
        if (partGr.next()) {
            participantRole = partGr.getValue('role');
        }
        
        // Check if user is session dealer/facilitator
        var isSessionDealer = false;
        var dealerId = sessionGr.getValue('dealer');
        var facilitatorId = sessionGr.getValue('facilitator');
        if (userId == dealerId || userId == facilitatorId) {
            isSessionDealer = true;
        }
        
        // Check if user is in dealer group
        var dealerGroupId = sessionGr.getValue('dealer_group');
        var isInDealerGroup = false;
        if (dealerGroupId) {
            var groupMemberGr = new GlideRecord('sys_user_grmember');
            groupMemberGr.addQuery('group', dealerGroupId);
            groupMemberGr.addQuery('user', userId);
            groupMemberGr.query();
            isInDealerGroup = groupMemberGr.hasNext();
        }
        
        // Determine effective role with priority
        var effectiveRole = participantRole || 'voter';
        var isDealer = isSessionDealer || isInDealerGroup;
        var canSwitchToVoter = isDealer && participantRole === 'dealer';
        var canSwitchToDealer = isDealer && participantRole === 'voter';
        
        return {
            effectiveRole: effectiveRole,
            isDealer: isDealer,
            participantRole: participantRole,
            canSwitchToVoter: canSwitchToVoter,
            canSwitchToDealer: canSwitchToDealer
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
        voteGr.query();
        
        while (voteGr.next()) {
            votes.push({
                voter: voteGr.getValue('voter'),
                voteValue: voteGr.getValue('vote_value'),
                voteNumericValue: voteGr.getValue('vote_numeric_value'),
                voteTime: voteGr.getValue('vote_time')
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
        var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
        voteGr.addQuery('story', storyId);
        voteGr.query();
        return voteGr.getRowCount();
    },
    
    _buildResponse: function(success, message, data) {
        return {
            success: success,
            message: message,
            data: data
        };
    },

    type: 'PlanningPokerSessionAjax'
});