var PlanningPokerAjax = Class.create();
PlanningPokerAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    getSession: function() {
        try {
            var sessionAjax = new PlanningPokerSessionAjax();
            this._copyParametersTo(sessionAjax);
            return this._setAnswerAndReturn(sessionAjax.getSession());
        } catch (e) {
            gs.error('[PlanningPokerAjax] getSession error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error retrieving session: ' + e, null));
        }
    },
    
    getVotingStatus: function() {
        try {
            var sessionAjax = new PlanningPokerSessionAjax();
            this._copyParametersTo(sessionAjax);
            return this._setAnswerAndReturn(sessionAjax.getVotingStatus());
        } catch (e) {
            gs.error('[PlanningPokerAjax] getVotingStatus error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error retrieving voting status: ' + e, null));
        }
    },
    
    startVoting: function() {
        try {
            var storyAjax = new PlanningPokerStoryAjax();
            this._copyParametersTo(storyAjax);
            return this._setAnswerAndReturn(storyAjax.startVoting());
        } catch (e) {
            gs.error('[PlanningPokerAjax] startVoting error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error starting voting: ' + e, null));
        }
    },
    
    castVote: function() {
        try {
            var votingAjax = new PlanningPokerVotingAjax();
            this._copyParametersTo(votingAjax);
            return this._setAnswerAndReturn(votingAjax.castVote());
        } catch (e) {
            gs.error('[PlanningPokerAjax] castVote error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error casting vote: ' + e, null));
        }
    },
    
    revealVotes: function() {
        try {
            var votingAjax = new PlanningPokerVotingAjax();
            this._copyParametersTo(votingAjax);
            return this._setAnswerAndReturn(votingAjax.revealVotes());
        } catch (e) {
            gs.error('[PlanningPokerAjax] revealVotes error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error revealing votes: ' + e, null));
        }
    },
    
    resetVotes: function() {
        try {
            var votingAjax = new PlanningPokerVotingAjax();
            this._copyParametersTo(votingAjax);
            return this._setAnswerAndReturn(votingAjax.resetVotes());
        } catch (e) {
            gs.error('[PlanningPokerAjax] resetVotes error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error resetting votes: ' + e, null));
        }
    },
    
    setStoryPoints: function() {
        try {
            var storyAjax = new PlanningPokerStoryAjax();
            this._copyParametersTo(storyAjax);
            return this._setAnswerAndReturn(storyAjax.setStoryPoints());
        } catch (e) {
            gs.error('[PlanningPokerAjax] setStoryPoints error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error setting story points: ' + e, null));
        }
    },
    
    updateStoryDetails: function() {
        try {
            var storyAjax = new PlanningPokerStoryAjax();
            this._copyParametersTo(storyAjax);
            return this._setAnswerAndReturn(storyAjax.updateStoryDetails());
        } catch (e) {
            gs.error('[PlanningPokerAjax] updateStoryDetails error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error updating story details: ' + e, null));
        }
    },
    
    completeStory: function() {
        try {
            var storyAjax = new PlanningPokerStoryAjax();
            this._copyParametersTo(storyAjax);
            return this._setAnswerAndReturn(storyAjax.completeStory());
        } catch (e) {
            gs.error('[PlanningPokerAjax] completeStory error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error completing story: ' + e, null));
        }
    },
    
    skipStory: function() {
        try {
            var storyAjax = new PlanningPokerStoryAjax();
            this._copyParametersTo(storyAjax);
            return this._setAnswerAndReturn(storyAjax.skipStory());
        } catch (e) {
            gs.error('[PlanningPokerAjax] skipStory error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error skipping story: ' + e, null));
        }
    },
    
    stopSession: function() {
        try {
            var storyAjax = new PlanningPokerStoryAjax();
            this._copyParametersTo(storyAjax);
            return this._setAnswerAndReturn(storyAjax.stopSession());
        } catch (e) {
            gs.error('[PlanningPokerAjax] stopSession error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error stopping session: ' + e, null));
        }
    },
    
    switchToStory: function() {
        try {
            var storyAjax = new PlanningPokerStoryAjax();
            this._copyParametersTo(storyAjax);
            return this._setAnswerAndReturn(storyAjax.switchToStory());
        } catch (e) {
            gs.error('[PlanningPokerAjax] switchToStory error: ' + e);
            return this._setAnswerAndReturn(this._buildResponse(false, 'Error switching to story: ' + e, null));
        }
    },
    
    // Helper methods
    _copyParametersTo: function(targetAjax) {
        // Copy request context to target AJAX processor
        targetAjax.request = this.request;
        targetAjax.getParameter = this.getParameter.bind(this);
        targetAjax.getParameterNames = this.getParameterNames.bind(this);
    },
    
    _setAnswerAndReturn: function(result) {
        var json = JSON.stringify(result);
        this.setAnswer(json);
        return json;
    },
    
    _buildResponse: function(success, message, data) {
        return {
            success: success,
            message: message,
            data: data
        };
    },

    type: 'PlanningPokerAjax'
});