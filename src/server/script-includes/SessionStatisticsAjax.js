var SessionStatisticsAjax = Class.create();
SessionStatisticsAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    getSessionStatistics: function() {
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
            
            // Only show statistics for completed sessions
            if (sessionGr.getValue('status') !== 'completed') {
                return this._buildResponse(false, 'Statistics only available for completed sessions', null);
            }
            
            // Pre-load all votes for the session in one query (eliminates N+1)
            var allVotesByStory = {};
            var allVotesList = [];
            var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
            voteGr.addQuery('session', sessionId);
            voteGr.query();
            while (voteGr.next()) {
                var vote = {
                    voter: voteGr.getValue('voter'),
                    vote_value: voteGr.getValue('vote_value'),
                    vote_numeric_value: voteGr.getValue('vote_numeric_value'),
                    vote_time: voteGr.getValue('vote_time'),
                    story: voteGr.getValue('story')
                };
                allVotesList.push(vote);
                var vStoryId = vote.story;
                if (!allVotesByStory[vStoryId]) allVotesByStory[vStoryId] = [];
                allVotesByStory[vStoryId].push(vote);
            }
            
            // Pre-load participants with dot-walk (no per-user query)
            var participantMap = {};
            var partGr = new GlideRecord('x_902080_planningw_session_participant');
            partGr.addQuery('session', sessionId);
            partGr.query();
            while (partGr.next()) {
                var uid = partGr.getValue('user');
                participantMap[uid] = {
                    name: partGr.getDisplayValue('user'),
                    role: partGr.getValue('role')
                };
            }
            
            var statistics = {
                sessionInfo: this._getSessionInfo(sessionGr),
                metrics: this._calculateMetrics(sessionId, allVotesByStory),
                votingPatterns: this._getVotingPatterns(allVotesList),
                storyDetails: this._getStoryDetails(sessionId, allVotesByStory),
                teamPerformance: this._getTeamPerformance(sessionId, allVotesByStory, participantMap)
            };
            
            return this._buildResponse(true, 'Statistics retrieved', statistics);
            
        } catch (e) {
            gs.error('[SessionStatisticsAjax] getSessionStatistics error: ' + e);
            return this._buildResponse(false, 'Error retrieving statistics: ' + e, null);
        }
    },
    
    // Helper methods
    _getSessionInfo: function(sessionGr) {
        var dealerName = '';
        var dealerGr = new GlideRecord('sys_user');
        if (dealerGr.get(sessionGr.getValue('dealer'))) {
            dealerName = dealerGr.getValue('name');
        }
        
        var scoringMethodName = '';
        var methodGr = new GlideRecord('x_902080_planningw_scoring_method');
        if (methodGr.get(sessionGr.getValue('scoring_method'))) {
            scoringMethodName = methodGr.getValue('name');
        }
        
        return {
            name: sessionGr.getValue('name'),
            description: sessionGr.getValue('description'),
            dealerName: dealerName,
            scoringMethod: scoringMethodName,
            createdOn: sessionGr.getValue('sys_created_on'),
            updatedOn: sessionGr.getValue('sys_updated_on'),
            duration: this._calculateDuration(sessionGr.getValue('sys_created_on'), sessionGr.getValue('sys_updated_on'))
        };
    },
    
    _calculateMetrics: function(sessionId, allVotesByStory) {
        var totalStories = 0;
        var completedStories = 0;
        var totalPoints = 0;
        var totalVotes = 0;
        var uniqueVoters = {};
        var totalRounds = 0;
        var consensusCount = 0;
        
        // Analyze stories
        var storyGr = new GlideRecord('x_902080_planningw_session_stories');
        storyGr.addQuery('session', sessionId);
        storyGr.query();
        
        while (storyGr.next()) {
            totalStories++;
            
            if (storyGr.getValue('status') === 'completed') {
                completedStories++;
                var points = parseFloat(storyGr.getValue('story_points') || '0');
                if (!isNaN(points)) {
                    totalPoints += points;
                }
            }
            
            // Use pre-loaded votes instead of per-story query
            var storyId = storyGr.getValue('sys_id');
            var storyVotes = allVotesByStory[storyId] || [];
            var storyVoteCount = storyVotes.length;
            var voteValues = {};
            
            for (var v = 0; v < storyVotes.length; v++) {
                totalVotes++;
                uniqueVoters[storyVotes[v].voter] = true;
                var voteValue = storyVotes[v].vote_value;
                voteValues[voteValue] = (voteValues[voteValue] || 0) + 1;
            }
            
            // Calculate rounds (times revoted + 1)
            var rounds = parseInt(storyGr.getValue('times_revoted') || '0', 10) + 1;
            totalRounds += rounds;
            
            // Check for consensus (all votes same non-special value)
            var uniqueValues = Object.keys(voteValues);
            if (uniqueValues.length === 1 && storyVoteCount > 1) {
                var value = uniqueValues[0];
                if (value !== '?' && value !== 'Pass' && value !== 'Break') {
                    consensusCount++;
                }
            }
        }
        
        var uniqueVoterCount = Object.keys(uniqueVoters).length;
        var averageRounds = totalStories > 0 ? Math.round((totalRounds / totalStories) * 100) / 100 : 0;
        var consensusRate = completedStories > 0 ? Math.round((consensusCount / completedStories) * 100) : 0;
        
        return {
            totalStories: totalStories,
            completedStories: completedStories,
            totalPoints: totalPoints,
            totalVotes: totalVotes,
            uniqueVoters: uniqueVoterCount,
            averageRounds: averageRounds,
            consensusRate: consensusRate
        };
    },
    
    _getVotingPatterns: function(allVotesList) {
        var voteDistribution = {};
        var insights = [];
        
        // Count all vote values from pre-loaded data
        for (var i = 0; i < allVotesList.length; i++) {
            var voteValue = allVotesList[i].vote_value;
            voteDistribution[voteValue] = (voteDistribution[voteValue] || 0) + 1;
        }
        
        // Generate insights
        var sortedVotes = Object.keys(voteDistribution).sort(function(a, b) {
            return voteDistribution[b] - voteDistribution[a];
        });
        
        if (sortedVotes.length > 0) {
            var mostCommon = sortedVotes[0];
            var mostCommonCount = voteDistribution[mostCommon];
            insights.push('Most common vote: ' + mostCommon + ' (' + mostCommonCount + ' times)');
            
            if (voteDistribution['?'] > 0) {
                insights.push('Team used uncertainty votes (' + voteDistribution['?'] + ' times) - consider breaking down complex stories');
            }
            
            if (voteDistribution['Pass'] > 0) {
                insights.push('Stories were passed ' + voteDistribution['Pass'] + ' times - review story readiness');
            }
        }
        
        return {
            distribution: voteDistribution,
            insights: insights
        };
    },
    
    _getStoryDetails: function(sessionId, allVotesByStory) {
        var stories = [];
        
        var storyGr = new GlideRecord('x_902080_planningw_session_stories');
        storyGr.addQuery('session', sessionId);
        storyGr.orderBy('order');
        storyGr.query();
        
        while (storyGr.next()) {
            var storyId = storyGr.getValue('sys_id');
            
            // Use pre-loaded votes instead of per-story query
            var storyVotes = allVotesByStory[storyId] || [];
            var votes = [];
            var voteDistribution = {};
            
            for (var v = 0; v < storyVotes.length; v++) {
                var voteValue = storyVotes[v].vote_value;
                voteDistribution[voteValue] = (voteDistribution[voteValue] || 0) + 1;
                
                votes.push({
                    voter: storyVotes[v].voter,
                    voteValue: voteValue,
                    voteNumericValue: storyVotes[v].vote_numeric_value
                });
            }
            
            // Calculate variance and consensus
            var voteUtils = new PlanningPokerVoteUtils();
            var summary = voteUtils.calculateVoteSummary(votes);
            
            var variance = 'Low';
            if (summary.validVotes > 1 && summary.max.numeric > summary.min.numeric) {
                var range = summary.max.numeric - summary.min.numeric;
                if (range > 5) {
                    variance = 'High';
                } else if (range > 2) {
                    variance = 'Medium';
                }
            }
            
            var consensus = 'No';
            var uniqueValues = Object.keys(voteDistribution);
            if (uniqueValues.length === 1 && votes.length > 1) {
                consensus = 'Yes';
            } else if (uniqueValues.length === 2 && votes.length > 2) {
                consensus = 'Partial';
            }
            
            stories.push({
                storyNumber: storyGr.getValue('story_number'),
                storyTitle: storyGr.getValue('story_title'),
                status: storyGr.getValue('status'),
                storyPoints: storyGr.getValue('story_points'),
                voteCount: votes.length,
                rounds: parseInt(storyGr.getValue('times_revoted') || '0', 10) + 1,
                variance: variance,
                consensus: consensus,
                voteDistribution: voteDistribution,
                votingSummary: summary
            });
        }
        
        return stories;
    },
    
    _getTeamPerformance: function(sessionId, allVotesByStory, participantMap) {
        var participants = {};
        
        // Use pre-loaded participant data (no per-user query)
        for (var uid in participantMap) {
            participants[uid] = {
                name: participantMap[uid].name,
                role: participantMap[uid].role,
                storiesVoted: 0,
                totalVotes: 0,
                avgResponseTime: 0,
                participationRate: 0
            };
        }
        
        // Count votes by participant using pre-loaded vote data
        var totalStories = 0;
        var storyGr = new GlideRecord('x_902080_planningw_session_stories');
        storyGr.addQuery('session', sessionId);
        storyGr.addQuery('status', 'IN', 'completed,revealed,skipped');
        storyGr.query();
        
        while (storyGr.next()) {
            totalStories++;
            var storyId = storyGr.getValue('sys_id');
            var storyVotes = allVotesByStory[storyId] || [];
            var storiesWithVotes = {};
            
            for (var v = 0; v < storyVotes.length; v++) {
                var voterId = storyVotes[v].voter;
                if (participants[voterId]) {
                    participants[voterId].totalVotes++;
                    storiesWithVotes[voterId] = true;
                }
            }
            
            // Count stories voted for each participant
            for (var uId in storiesWithVotes) {
                if (participants[uId]) {
                    participants[uId].storiesVoted++;
                }
            }
        }
        
        // Calculate participation rates
        var performanceArray = [];
        for (var userId in participants) {
            var participant = participants[userId];
            
            if (participant.role !== 'spectator' && totalStories > 0) {
                participant.participationRate = Math.round((participant.storiesVoted / totalStories) * 100);
            }
            
            performanceArray.push(participant);
        }
        
        // Sort by participation rate
        performanceArray.sort(function(a, b) {
            return b.participationRate - a.participationRate;
        });
        
        return performanceArray;
    },
    
    _calculateDuration: function(startTime, endTime) {
        if (!startTime || !endTime) return 'Unknown';
        
        var start = new GlideDateTime(startTime);
        var end = new GlideDateTime(endTime);
        var diffMs = end.getNumericValue() - start.getNumericValue();
        var diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 60) {
            return diffMinutes + ' minutes';
        } else {
            var hours = Math.floor(diffMinutes / 60);
            var minutes = diffMinutes % 60;
            return hours + ' hours, ' + minutes + ' minutes';
        }
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

    type: 'SessionStatisticsAjax'
});