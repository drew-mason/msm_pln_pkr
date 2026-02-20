var PlanningPokerStoryAjax = Class.create();
PlanningPokerStoryAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    startVoting: function() {
        try {
            gs.info('[PlanningPokerStoryAjax] startVoting called');
            
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
                return this._buildResponse(false, 'You do not have permission to start voting', null);
            }
            
            // Validate session is not completed/cancelled
            var sessionStatus = sessionGr.getValue('status');
            if (sessionStatus === 'completed' || sessionStatus === 'cancelled') {
                return this._buildResponse(false, 'Cannot start voting on a ' + sessionStatus + ' session', null);
            }
            
            // Update story status and set current story
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, 'Story not found', null);
            }
            
            storyGr.setValue('status', 'voting');
            storyGr.setValue('voting_started', new GlideDateTime());
            storyGr.setValue('is_current_story', true);
            storyGr.update();
            
            // Update session current_story
            sessionGr.setValue('current_story', storyId);
            if (sessionStatus === 'ready') {
                sessionGr.setValue('status', 'live');
            }
            sessionGr.update();
            
            // Clear other stories' current_story flag
            var otherStoriesGr = new GlideRecord('x_902080_planningw_session_stories');
            otherStoriesGr.addQuery('session', sessionId);
            otherStoriesGr.addQuery('sys_id', '!=', storyId);
            otherStoriesGr.query();
            
            while (otherStoriesGr.next()) {
                otherStoriesGr.setValue('is_current_story', false);
                otherStoriesGr.update();
            }
            
            return this._buildResponse(true, 'Voting started successfully', {
                storyId: storyId,
                sessionStatus: sessionGr.getValue('status')
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] startVoting error: ' + e);
            return this._buildResponse(false, 'Error starting voting: ' + e, null);
        }
    },
    
    setStoryPoints: function() {
        try {
            gs.info('[PlanningPokerStoryAjax] setStoryPoints called');
            
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            var storyPoints = this.getParameter('story_points');
            
            if (!sessionId || !storyId || !storyPoints) {
                return this._buildResponse(false, 'Session ID, story ID, and story points required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check permissions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionId, userId)) {
                return this._buildResponse(false, 'You do not have permission to set story points', null);
            }
            
            // Update story with final points
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, 'Story not found', null);
            }
            
            storyGr.setValue('story_points', storyPoints);
            storyGr.setValue('status', 'completed');
            storyGr.setValue('voting_completed', new GlideDateTime());
            storyGr.update();
            
            // Update linked rm_story if present
            var rmStoryId = storyGr.getValue('story');
            if (rmStoryId) {
                var rmStoryGr = new GlideRecord('rm_story');
                if (rmStoryGr.get(rmStoryId)) {
                    rmStoryGr.setValue('story_points', storyPoints);
                    rmStoryGr.update();
                }
            }
            
            // Auto-advance to next pending story
            var nextStory = this._getNextPendingStory(sessionId);
            if (nextStory) {
                nextStory.setValue('status', 'voting');
                nextStory.setValue('voting_started', new GlideDateTime());
                nextStory.setValue('is_current_story', true);
                nextStory.update();
                
                // Update session current_story
                sessionGr.setValue('current_story', nextStory.getValue('sys_id'));
                sessionGr.update();
            } else {
                // No more stories - session may auto-complete via business rule
                sessionGr.setValue('current_story', '');
                sessionGr.update();
            }
            
            return this._buildResponse(true, 'Story points set successfully', {
                storyId: storyId,
                storyPoints: storyPoints,
                nextStoryId: nextStory ? nextStory.getValue('sys_id') : null
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] setStoryPoints error: ' + e);
            return this._buildResponse(false, 'Error setting story points: ' + e, null);
        }
    },
    
    updateStoryDetails: function() {
        try {
            gs.info('[PlanningPokerStoryAjax] updateStoryDetails called');
            
            var storyId = this.getParameter('story_id');
            var field = this.getParameter('field');
            var value = this.getParameter('value');
            
            if (!storyId || !field || value === undefined) {
                return this._buildResponse(false, 'Story ID, field, and value required', null);
            }
            
            // Allowed fields for updates
            var allowedFields = ['story_title', 'story_description', 'acceptance_criteria', 'dealer_comments'];
            if (allowedFields.indexOf(field) === -1) {
                return this._buildResponse(false, 'Field not allowed for updates: ' + field, null);
            }
            
            var userId = gs.getUserID();
            
            // Get story and validate permissions
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, 'Story not found', null);
            }
            
            var sessionId = storyGr.getValue('session');
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            var security = new PlanningPokerSecurity();
            if (!security.canAccessSession(sessionId, userId)) {
                return this._buildResponse(false, 'Access denied', null);
            }
            
            // Update rm_story if reference exists and field is story content
            var rmStoryId = storyGr.getValue('story');
            if (rmStoryId && (field === 'story_title' || field === 'story_description' || field === 'acceptance_criteria')) {
                var rmStoryGr = new GlideRecord('rm_story');
                if (rmStoryGr.get(rmStoryId)) {
                    var rmFieldMap = {
                        'story_title': 'short_description',
                        'story_description': 'description',
                        'acceptance_criteria': 'acceptance_criteria'
                    };
                    
                    var rmField = rmFieldMap[field];
                    if (rmField) {
                        rmStoryGr.setValue(rmField, value);
                        rmStoryGr.update();
                        gs.info('[PlanningPokerStoryAjax] Updated rm_story field: ' + rmField);
                    }
                }
            }
            
            // Also update session_stories as fallback
            storyGr.setValue(field, value);
            storyGr.update();
            
            return this._buildResponse(true, 'Story details updated successfully', {
                storyId: storyId,
                field: field,
                value: value
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] updateStoryDetails error: ' + e);
            return this._buildResponse(false, 'Error updating story details: ' + e, null);
        }
    },
    
    completeStory: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            var storyPoints = this.getParameter('story_points');
            var comments = this.getParameter('comments') || '';
            
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
                return this._buildResponse(false, 'You do not have permission to complete stories', null);
            }
            
            // Update story
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, 'Story not found', null);
            }
            
            storyGr.setValue('status', 'completed');
            storyGr.setValue('voting_completed', new GlideDateTime());
            if (storyPoints) {
                storyGr.setValue('story_points', storyPoints);
            }
            if (comments) {
                storyGr.setValue('dealer_comments', comments);
            }
            storyGr.update();
            
            // Auto-advance to next story
            var nextStory = this._getNextPendingStory(sessionId);
            if (nextStory) {
                nextStory.setValue('status', 'voting');
                nextStory.setValue('voting_started', new GlideDateTime());
                nextStory.setValue('is_current_story', true);
                nextStory.update();
                
                sessionGr.setValue('current_story', nextStory.getValue('sys_id'));
                sessionGr.update();
            }
            
            return this._buildResponse(true, 'Story completed successfully', {
                storyId: storyId,
                nextStoryId: nextStory ? nextStory.getValue('sys_id') : null
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] completeStory error: ' + e);
            return this._buildResponse(false, 'Error completing story: ' + e, null);
        }
    },
    
    skipStory: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            var comments = this.getParameter('comments') || '';
            
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
                return this._buildResponse(false, 'You do not have permission to skip stories', null);
            }
            
            // Update story status
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, 'Story not found', null);
            }
            
            storyGr.setValue('status', 'skipped');
            storyGr.setValue('dealer_comments', comments);
            storyGr.update();
            
            // Auto-advance to next story
            var nextStory = this._getNextPendingStory(sessionId);
            if (nextStory) {
                nextStory.setValue('status', 'voting');
                nextStory.setValue('voting_started', new GlideDateTime());
                nextStory.setValue('is_current_story', true);
                nextStory.update();
                
                sessionGr.setValue('current_story', nextStory.getValue('sys_id'));
                sessionGr.update();
            }
            
            return this._buildResponse(true, 'Story skipped successfully', {
                storyId: storyId,
                nextStoryId: nextStory ? nextStory.getValue('sys_id') : null
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] skipStory error: ' + e);
            return this._buildResponse(false, 'Error skipping story: ' + e, null);
        }
    },
    
    stopSession: function() {
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
            if (!security.canManageSession(sessionId, userId)) {
                return this._buildResponse(false, 'You do not have permission to stop sessions', null);
            }
            
            // Update session status
            sessionGr.setValue('status', 'completed');
            sessionGr.setValue('current_story', '');
            sessionGr.setValue('active', false);
            sessionGr.update();
            
            return this._buildResponse(true, 'Session stopped successfully', null);
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] stopSession error: ' + e);
            return this._buildResponse(false, 'Error stopping session: ' + e, null);
        }
    },
    
    switchToStory: function() {
        try {
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
                return this._buildResponse(false, 'You do not have permission to switch stories', null);
            }
            
            // Clear current story flag from all stories
            var allStoriesGr = new GlideRecord('x_902080_planningw_session_stories');
            allStoriesGr.addQuery('session', sessionId);
            allStoriesGr.query();
            
            while (allStoriesGr.next()) {
                allStoriesGr.setValue('is_current_story', false);
                allStoriesGr.update();
            }
            
            // Set new current story
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, 'Story not found', null);
            }
            
            storyGr.setValue('status', 'voting');
            storyGr.setValue('voting_started', new GlideDateTime());
            storyGr.setValue('is_current_story', true);
            storyGr.update();
            
            // Update session
            sessionGr.setValue('current_story', storyId);
            sessionGr.update();
            
            return this._buildResponse(true, 'Switched to story successfully', {
                storyId: storyId
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] switchToStory error: ' + e);
            return this._buildResponse(false, 'Error switching to story: ' + e, null);
        }
    },
    
    // Helper methods
    _getNextPendingStory: function(sessionId) {
        var nextStoryGr = new GlideRecord('x_902080_planningw_session_stories');
        nextStoryGr.addQuery('session', sessionId);
        nextStoryGr.addQuery('status', 'pending');
        nextStoryGr.orderBy('order');
        nextStoryGr.query();
        
        if (nextStoryGr.next()) {
            return nextStoryGr;
        }
        return null;
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

    type: 'PlanningPokerStoryAjax'
});