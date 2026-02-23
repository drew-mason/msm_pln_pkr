var PlanningPokerStoryAjax = Class.create();
PlanningPokerStoryAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    startVoting: function() {
        try {
            gs.debug('[PlanningPokerStoryAjax] startVoting called');
            
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            
            var validation = this._validateStoryAction(sessionId, storyId);
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
            }

            var sessionGr = validation.sessionGr;
            var storyGr = validation.storyGr;
            
            // Validate session is not completed/cancelled
            var sessionStatus = sessionGr.getValue('status');
            if (sessionStatus === PlanningPokerConstants.STATUS.COMPLETED || sessionStatus === PlanningPokerConstants.STATUS.CANCELLED) {
                return this._buildResponse(false, 'Cannot start voting on a ' + sessionStatus + ' session', null);
            }
            
            storyGr.setValue('status', PlanningPokerConstants.STATUS.VOTING);
            storyGr.setValue('voting_started', new GlideDateTime());
            storyGr.setValue('is_current_story', true);
            storyGr.update();
            
            // Update session current_story
            sessionGr.setValue('current_story', storyId);
            if (sessionStatus === PlanningPokerConstants.STATUS.READY) {
                sessionGr.setValue('status', PlanningPokerConstants.STATUS.LIVE);
            }
            sessionGr.update();
            
            // Clear other stories' is_current_story flag
            var otherStoriesGr = new GlideRecord('x_902080_planningw_session_stories');
            otherStoriesGr.addQuery('session', sessionId);
            otherStoriesGr.addQuery('sys_id', '!=', storyId);
            otherStoriesGr.addQuery('is_current_story', true);
            otherStoriesGr.setValue('is_current_story', false);
            otherStoriesGr.updateMultiple();
            
            return this._buildResponse(true, 'Voting started successfully', {
                storyId: storyId,
                sessionStatus: sessionGr.getValue('status')
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] startVoting error: ' + e);
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    setStoryPoints: function() {
        try {
            gs.debug('[PlanningPokerStoryAjax] setStoryPoints called');
            
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            var storyPoints = this.getParameter('story_points');
            
            if (!storyPoints) {
                return this._buildResponse(false, 'Story points required', null);
            }
            
            // Validate story points format (simple check to prevent injection/bad data)
            // Allow numbers, ?, PASS, BREAK, or T-shirt sizes
            var allowedValues = [
                PlanningPokerConstants.VOTE_VALUES.UNKNOWN, 
                PlanningPokerConstants.VOTE_VALUES.PASS, 
                PlanningPokerConstants.VOTE_VALUES.BREAK
            ];
            // Also allow standard poker numbers
            var isNumeric = !isNaN(parseFloat(storyPoints)) && isFinite(storyPoints);
            // Also allow T-shirt sizes
            var isTShirt = PlanningPokerConstants.VOTE_VALUES.TSHIRT_MAP.hasOwnProperty(storyPoints);
            
            if (!isNumeric && !isTShirt && allowedValues.indexOf(storyPoints) === -1) {
                 // Relax validation slightly if needed, but for now enforce known patterns
                 // Actually, let's just ensure it's not too long or weird.
                 if (String(storyPoints).length > 10) {
                     return this._buildResponse(false, 'Invalid story points value', null);
                 }
            }

            var validation = this._validateStoryAction(sessionId, storyId);
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
            }
            
            var storyGr = validation.storyGr;
            
            // Build work notes from vote data (before updating story to avoid double update)
            var workNotes = this.getParameter('work_notes') || '';
            var voteLog = this._buildVoteLog(storyId, sessionId, storyPoints);
            var fullWorkNotes = voteLog;
            if (workNotes) {
                fullWorkNotes += '\n\n[b]Dealer Notes:[/b]\n' + workNotes;
            }
            
            // Set all story fields and update once (single BR trigger)
            storyGr.setValue('story_points', storyPoints);
            storyGr.setValue('status', PlanningPokerConstants.STATUS.COMPLETED);
            storyGr.setValue('voting_completed', new GlideDateTime());
            var existingComments = storyGr.getValue('dealer_comments') || '';
            if (workNotes) {
                storyGr.setValue('dealer_comments', existingComments + '\n' + workNotes);
            }
            storyGr.update();
            
            // Update linked rm_story if present
            var rmStoryId = storyGr.getValue('story');
            if (rmStoryId) {
                var rmStoryGr = new GlideRecord('rm_story');
                if (rmStoryGr.get(rmStoryId)) {
                    rmStoryGr.setValue('story_points', storyPoints);
                    rmStoryGr.work_notes = fullWorkNotes;
                    rmStoryGr.update();
                }
            }
            
            // Auto-advance to next pending story
            var nextStory = this._advanceToNextStory(sessionId);
            
            return this._buildResponse(true, 'Story points set successfully', {
                storyId: storyId,
                storyPoints: storyPoints,
                nextStoryId: nextStory ? nextStory.getValue('sys_id') : null
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] setStoryPoints error: ' + e);
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    updateStoryDetails: function() {
        try {
            gs.debug('[PlanningPokerStoryAjax] updateStoryDetails called');
            
            var storyId = this.getParameter('story_id');
            var field = this.getParameter('field');
            var value = this.getParameter('value');
            
            // Note: We need sessionId to validate permission, so we must fetch story first to get session ID
            if (!storyId || !field || value === undefined) {
                return this._buildResponse(false, 'Story ID, field, and value required', null);
            }

            if (!/^[0-9a-f]{32}$/i.test(storyId)) {
                return this._buildResponse(false, 'Invalid story ID format', null);
            }

            // Cap value length
            value = String(value).substring(0, 4000);
            
            // Allowed fields for updates
            var allowedFields = ['story_title', 'story_description', 'acceptance_criteria', 'dealer_comments'];
            if (allowedFields.indexOf(field) === -1) {
                return this._buildResponse(false, 'Field not allowed for updates: ' + field, null);
            }
            
            // Fetch story to get session ID
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(storyId)) {
                return this._buildResponse(false, PlanningPokerConstants.ERRORS.STORY_NOT_FOUND, null);
            }
            var sessionId = storyGr.getValue('session');
            
            // Use standard validation now that we have session ID
            var validation = this._validateStoryAction(sessionId, storyId);
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
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
                        gs.debug('[PlanningPokerStoryAjax] Updated rm_story field: ' + rmField);
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
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    completeStory: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            var storyPoints = this.getParameter('story_points');
            var comments = this.getParameter('comments') || '';
            
            var validation = this._validateStoryAction(sessionId, storyId);
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
            }
            
            var storyGr = validation.storyGr;
            
            storyGr.setValue('status', PlanningPokerConstants.STATUS.COMPLETED);
            storyGr.setValue('voting_completed', new GlideDateTime());
            if (storyPoints) {
                storyGr.setValue('story_points', storyPoints);
            }
            if (comments) {
                storyGr.setValue('dealer_comments', comments);
            }
            storyGr.update();
            
            // Auto-advance to next story
            var nextStory = this._advanceToNextStory(sessionId);
            
            return this._buildResponse(true, 'Story completed successfully', {
                storyId: storyId,
                nextStoryId: nextStory ? nextStory.getValue('sys_id') : null
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] completeStory error: ' + e);
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    skipStory: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            var comments = this.getParameter('comments') || '';
            
            var validation = this._validateStoryAction(sessionId, storyId);
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
            }
            
            var storyGr = validation.storyGr;
            
            storyGr.setValue('status', PlanningPokerConstants.STATUS.SKIPPED);
            storyGr.setValue('dealer_comments', comments);
            storyGr.update();
            
            // Auto-advance to next story
            var nextStory = this._advanceToNextStory(sessionId);
            
            return this._buildResponse(true, 'Story skipped successfully', {
                storyId: storyId,
                nextStoryId: nextStory ? nextStory.getValue('sys_id') : null
            });
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] skipStory error: ' + e);
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    stopSession: function() {
        try {
            var sessionId = this.getParameter('session_id');
            if (!sessionId) {
                return this._buildResponse(false, PlanningPokerConstants.ERRORS.SESSION_ID_REQUIRED, null);
            }
            
            // Use common validation but skip story check since this is session-level
            var validation = this._validateSessionAction(sessionId);
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
            }
            
            var sessionGr = validation.sessionGr;
            
            // Update session status
            sessionGr.setValue('status', PlanningPokerConstants.STATUS.COMPLETED);
            sessionGr.setValue('current_story', '');
            sessionGr.setValue('active', false);
            sessionGr.update();
            
            return this._buildResponse(true, 'Session stopped successfully', null);
            
        } catch (e) {
            gs.error('[PlanningPokerStoryAjax] stopSession error: ' + e);
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    switchToStory: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            
            var validation = this._validateStoryAction(sessionId, storyId);
            if (!validation.isValid) {
                return this._buildResponse(false, validation.message, null);
            }
            
            var sessionGr = validation.sessionGr;
            var storyGr = validation.storyGr;
            
            // Clear current story flag from all stories
            var allStoriesGr = new GlideRecord('x_902080_planningw_session_stories');
            allStoriesGr.addQuery('session', sessionId);
            allStoriesGr.addQuery('is_current_story', true);
            allStoriesGr.setValue('is_current_story', false);
            allStoriesGr.updateMultiple();
            
            storyGr.setValue('status', PlanningPokerConstants.STATUS.VOTING);
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
            return this._buildResponse(false, PlanningPokerConstants.ERRORS.INTERNAL_ERROR, null);
        }
    },
    
    // Helper methods
    
    _validateSessionAction: function(sessionId) {
        if (!sessionId) return { isValid: false, message: PlanningPokerConstants.ERRORS.SESSION_ID_REQUIRED };
        if (!/^[0-9a-f]{32}$/i.test(sessionId)) return { isValid: false, message: PlanningPokerConstants.ERRORS.INVALID_SESSION_FORMAT };

        var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
        if (!sessionGr.get(sessionId)) {
            return { isValid: false, message: PlanningPokerConstants.ERRORS.SESSION_NOT_FOUND };
        }

        var userId = gs.getUserID();
        var security = new PlanningPokerSecurity();
        if (!security.canManageSession(sessionId, userId)) {
            return { isValid: false, message: PlanningPokerConstants.ERRORS.PERMISSION_DENIED };
        }

        return { isValid: true, sessionGr: sessionGr };
    },

    _validateStoryAction: function(sessionId, storyId) {
        if (!sessionId || !storyId) {
            return { isValid: false, message: 'Session ID and story ID required' };
        }
        
        // 1. Validate Session Access
        var sessionValidation = this._validateSessionAction(sessionId);
        if (!sessionValidation.isValid) return sessionValidation;
        
        // 2. Validate Story Existence
        var storyGr = new GlideRecord('x_902080_planningw_session_stories');
        if (!storyGr.get(storyId)) {
            return { isValid: false, message: PlanningPokerConstants.ERRORS.STORY_NOT_FOUND };
        }

        // 3. IDOR Check: Ensure story belongs to the session
        if (storyGr.getValue('session') !== sessionId) {
            return { isValid: false, message: PlanningPokerConstants.ERRORS.STORY_NOT_IN_SESSION };
        }

        return { 
            isValid: true, 
            sessionGr: sessionValidation.sessionGr, 
            storyGr: storyGr 
        };
    },

    _advanceToNextStory: function(sessionId) {
        // Clear is_current_story flag (housekeeping — suppress business rules)
        var clearGr = new GlideRecord('x_902080_planningw_session_stories');
        clearGr.addQuery('session', sessionId);
        clearGr.addQuery('is_current_story', true);
        clearGr.setWorkflow(false);
        clearGr.setValue('is_current_story', false);
        clearGr.updateMultiple();
        
        // Re-load session to get latest state (avoids stale data after BR cascades)
        var freshSessionGr = new GlideRecord('x_902080_planningw_planning_session');
        if (!freshSessionGr.get(sessionId)) {
            return null;
        }
        
        // Don't advance if session was already completed/cancelled by business rule
        var currentStatus = freshSessionGr.getValue('status');
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            return null;
        }
        
        var nextStory = this._getNextPendingStory(sessionId);
        if (nextStory) {
            // Keep as pending — dealer must explicitly start voting
            nextStory.setValue('is_current_story', true);
            nextStory.setWorkflow(false);
            nextStory.update();
            
            freshSessionGr.setValue('current_story', nextStory.getValue('sys_id'));
            freshSessionGr.update();
        } else {
            freshSessionGr.setValue('current_story', '');
            freshSessionGr.update();
        }
        return nextStory;
    },
    
    _getNextPendingStory: function(sessionId) {
        var nextStoryGr = new GlideRecord('x_902080_planningw_session_stories');
        nextStoryGr.addQuery('session', sessionId);
        nextStoryGr.addQuery('status', PlanningPokerConstants.STATUS.PENDING);
        nextStoryGr.orderBy('order');
        nextStoryGr.query();
        
        if (nextStoryGr.next()) {
            return nextStoryGr;
        }
        return null;
    },
    
    _buildVoteLog: function(storyId, sessionId, finalPoints) {
        var log = '[b]Planning Poker Vote Summary[/b]\n';
        log += 'Final Estimate: ' + finalPoints + '\n';
        log += 'Finalized: ' + new GlideDateTime().getDisplayValue() + '\n\n';

        // Get all votes for this story
        var votes = [];
        var voterIds = {};
        var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
        voteGr.addQuery('story', storyId);
        voteGr.orderBy('vote_time');
        voteGr.query();
        while (voteGr.next()) {
            var voterId = voteGr.getValue('voter');
            var voterGr = new GlideRecord('sys_user');
            var voterName = voterId;
            if (voterGr.get(voterId)) {
                voterName = voterGr.getValue('name');
            }
            votes.push({
                name: voterName,
                value: voteGr.getValue('vote_value')
            });
            voterIds[voterId] = true;
        }

        // Build vote tally (group by value)
        var tally = {};
        for (var i = 0; i < votes.length; i++) {
            var val = votes[i].value;
            if (!tally[val]) {
                tally[val] = { count: 0, voters: [] };
            }
            tally[val].count++;
            tally[val].voters.push(votes[i].name);
        }

        log += '[b]Votes Cast:[/b]\n';
        for (var v in tally) {
            if (tally.hasOwnProperty(v)) {
                log += '  ' + v + ' (' + tally[v].count + '): ' + tally[v].voters.join(', ') + '\n';
            }
        }

        // Find participants who didn't vote (voters only)
        var nonVoters = [];
        var partGr = new GlideRecord('x_902080_planningw_session_participant');
        partGr.addQuery('session', sessionId);
        partGr.addQuery('status', PlanningPokerConstants.STATUS.ACTIVE);
        partGr.query();
        while (partGr.next()) {
            var role = partGr.getValue('role') || '';
            var isVoter = (role === PlanningPokerConstants.ROLES.VOTER || role.indexOf('voter') > -1);
            if (isVoter) {
                var uid = partGr.getValue('user');
                if (!voterIds[uid]) {
                    nonVoters.push(partGr.getDisplayValue('user'));
                }
            }
        }

        if (nonVoters.length > 0) {
            log += '\n[b]Did Not Vote:[/b]\n  ' + nonVoters.join(', ') + '\n';
        } else {
            log += '\n[i]All voters participated.[/i]\n';
        }

        return log;
    },

    _buildResponse: function(success, message, data) {
        return JSON.stringify({
            success: success,
            message: message,
            data: data
        });
    },

    type: 'PlanningPokerStoryAjax'
});