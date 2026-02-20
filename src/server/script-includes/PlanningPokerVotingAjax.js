var PlanningPokerVotingAjax = Class.create();
PlanningPokerVotingAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    castVote: function() {
        try {
            gs.info('[PlanningPokerVotingAjax] castVote called');
            
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            var voteValue = this.getParameter('vote_value');
            
            if (!sessionId || !storyId || !voteValue) {
                return this._buildResponse(false, 'Session ID, story ID, and vote value required', null);
            }
            
            var userId = gs.getUserID();
            
            // Validate session exists
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            // Check permissions
            var security = new PlanningPokerSecurity();
            if (!security.canVote(sessionId, userId)) {
                return this._buildResponse(false, 'You do not have permission to vote', null);
            }
            
            // Validate story belongs to session
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId) || storyGr.getValue('session') != sessionId) {
                return this._buildResponse(false, 'Story not found in session', null);
            }
            
            // Check story status allows voting
            var storyStatus = storyGr.getValue('status');
            if (storyStatus !== 'voting' && storyStatus !== 'revealed') {
                return this._buildResponse(false, 'Voting is not active for this story', null);
            }
            
            // Get numeric value for the vote
            var voteUtils = new PlanningPokerVoteUtils();
            var numericValue = voteUtils.getNumericPoints(voteValue);
            
            // Check if user already voted - update existing vote or create new one
            var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
            voteGr.addQuery('session', sessionId);
            voteGr.addQuery('story', storyId);
            voteGr.addQuery('voter', userId);
            voteGr.query();
            
            if (voteGr.next()) {
                // Update existing vote
                voteGr.setValue('vote_value', voteValue);
                voteGr.setValue('vote_numeric_value', numericValue);
                voteGr.setValue('vote_time', new GlideDateTime());
                voteGr.update();
                gs.info('[PlanningPokerVotingAjax] Updated existing vote for user: ' + userId);
            } else {
                // Create new vote
                voteGr.initialize();
                voteGr.setValue('session', sessionId);
                voteGr.setValue('story', storyId);
                voteGr.setValue('voter', userId);
                voteGr.setValue('vote_value', voteValue);
                voteGr.setValue('vote_numeric_value', numericValue);
                voteGr.setValue('vote_time', new GlideDateTime());
                voteGr.insert();
                gs.info('[PlanningPokerVotingAjax] Created new vote for user: ' + userId);
            }
            
            return this._buildResponse(true, 'Vote cast successfully', {
                voteValue: voteValue,
                numericValue: numericValue
            });
            
        } catch (e) {
            gs.error('[PlanningPokerVotingAjax] castVote error: ' + e);
            return this._buildResponse(false, 'Error casting vote: ' + e, null);
        }
    },
    
    revealVotes: function() {
        try {
            gs.info('[PlanningPokerVotingAjax] revealVotes called');
            
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            
            if (!sessionId || !storyId) {
                return this._buildResponse(false, 'Session ID and story ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionId, userId)) {
                return this._buildResponse(false, 'You do not have permission to reveal votes', null);
            }
            
            // Update story status to revealed
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, 'Story not found', null);
            }
            
            storyGr.setValue('status', 'revealed');
            storyGr.update();
            
            // Get all votes and calculate statistics
            var votes = [];
            var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
            voteGr.addQuery('story', storyId);
            voteGr.orderBy('vote_time');
            voteGr.query();
            
            while (voteGr.next()) {
                var voterGr = new GlideRecord('sys_user');
                if (voterGr.get(voteGr.getValue('voter'))) {
                    votes.push({
                        voter: voteGr.getValue('voter'),
                        voterName: voterGr.getValue('name'),
                        vote_value: voteGr.getValue('vote_value'),
                        vote_numeric_value: voteGr.getValue('vote_numeric_value'),
                        voteTime: voteGr.getValue('vote_time')
                    });
                }
            }
            
            // Calculate summary statistics
            var voteUtils = new PlanningPokerVoteUtils();
            var summary = voteUtils.calculateVoteSummary(votes);
            
            return this._buildResponse(true, 'Votes revealed successfully', {
                votes: votes,
                summary: summary
            });
            
        } catch (e) {
            gs.error('[PlanningPokerVotingAjax] revealVotes error: ' + e);
            return this._buildResponse(false, 'Error revealing votes: ' + e, null);
        }
    },
    
    resetVotes: function() {
        try {
            gs.info('[PlanningPokerVotingAjax] resetVotes called');
            
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            
            if (!sessionId || !storyId) {
                return this._buildResponse(false, 'Session ID and story ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionId, userId)) {
                return this._buildResponse(false, 'You do not have permission to reset votes', null);
            }
            
            // Count then bulk-delete all votes for this story
            var countGa = new GlideAggregate('x_902080_planningw_planning_vote');
            countGa.addQuery('story', storyId);
            countGa.addAggregate('COUNT');
            countGa.query();
            var deletedCount = 0;
            if (countGa.next()) {
                deletedCount = parseInt(countGa.getAggregate('COUNT'), 10);
            }
            
            var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
            voteGr.addQuery('story', storyId);
            voteGr.deleteMultiple();
            
            // Update story: increment times_revoted, reset status to voting, update timestamp
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (storyGr.get(storyId)) {
                var timesRevoted = parseInt(storyGr.getValue('times_revoted') || '0', 10);
                storyGr.setValue('times_revoted', timesRevoted + 1);
                storyGr.setValue('status', 'voting');
                storyGr.setValue('voting_started', new GlideDateTime());
                storyGr.update();
            }
            
            gs.info('[PlanningPokerVotingAjax] Reset ' + deletedCount + ' votes for story: ' + storyId);
            
            return this._buildResponse(true, 'Votes reset successfully', {
                deletedVotes: deletedCount,
                newStatus: 'voting'
            });
            
        } catch (e) {
            gs.error('[PlanningPokerVotingAjax] resetVotes error: ' + e);
            return this._buildResponse(false, 'Error resetting votes: ' + e, null);
        }
    },
    
    _buildResponse: function(success, message, data) {
        return {
            success: success,
            message: message,
            data: data
        };
    },

    type: 'PlanningPokerVotingAjax'
});