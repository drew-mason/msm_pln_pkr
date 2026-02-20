var DemoSessionAjax = Class.create();
DemoSessionAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    createDemoSession: function() {
        try {
            gs.info('[DemoSessionAjax] Creating demo session');
            
            var userId = gs.getUserID();
            
            // Check if user can create sessions
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('x_902080_planningw.dealer')) {
                return this._buildResponse(false, 'You do not have permission to create demo sessions', null);
            }
            
            // Get default scoring method (Fibonacci)
            var scoringMethodGr = new GlideRecord('x_902080_planningw_scoring_method');
            scoringMethodGr.addQuery('name', 'Fibonacci');
            scoringMethodGr.addQuery('active', true);
            scoringMethodGr.query();
            
            if (!scoringMethodGr.next()) {
                return this._buildResponse(false, 'Default scoring method not found. Please ensure Fibonacci method exists.', null);
            }
            
            var scoringMethodId = scoringMethodGr.getValue('sys_id');
            
            // Generate demo session
            var sessionCode = this._generateSessionCode();
            var sessionName = 'Demo Session - ' + new GlideDateTime().getDisplayValue();
            
            // Create demo session
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            sessionGr.initialize();
            sessionGr.setValue('name', sessionName);
            sessionGr.setValue('description', 'Demo session with sample stories and participants for testing Planning Poker functionality.');
            sessionGr.setValue('status', 'ready');
            sessionGr.setValue('session_code', sessionCode);
            sessionGr.setValue('dealer', userId);
            sessionGr.setValue('scoring_method', scoringMethodId);
            sessionGr.setValue('allow_spectators', true);
            sessionGr.setValue('easy_mode', true);
            sessionGr.setValue('demo_mode', true);
            sessionGr.setValue('active', true);
            
            var sessionId = sessionGr.insert();
            
            if (!sessionId) {
                return this._buildResponse(false, 'Failed to create demo session', null);
            }
            
            // Create dealer participant record
            this._createParticipant(sessionId, userId, 'dealer', true);
            
            // Add demo participants (fake users for demo)
            var demoParticipants = this._createDemoParticipants(sessionId);
            
            // Create demo stories
            var demoStories = this._createDemoStories(sessionId);
            
            // Create some demo votes for the first story
            if (demoStories.length > 0) {
                this._createDemoVotes(sessionId, demoStories[0], demoParticipants);
            }
            
            gs.info('[DemoSessionAjax] Demo session created: ' + sessionId);
            
            return this._buildResponse(true, 'Demo session created successfully', {
                sessionId: sessionId,
                sessionCode: sessionCode,
                sessionName: sessionName,
                participantCount: demoParticipants.length + 1, // +1 for creator
                storyCount: demoStories.length
            });
            
        } catch (e) {
            gs.error('[DemoSessionAjax] createDemoSession error: ' + e);
            return this._buildResponse(false, 'Error creating demo session: ' + e, null);
        }
    },
    
    cleanupDemoSessions: function() {
        try {
            gs.info('[DemoSessionAjax] Cleaning up demo sessions');
            
            var userId = gs.getUserID();
            
            // Check admin permissions for cleanup
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'You do not have permission to cleanup demo sessions', null);
            }
            
            var deletedCount = 0;
            
            // Find all demo sessions older than 24 hours
            var cutoffTime = new GlideDateTime();
            cutoffTime.addSeconds(-86400); // 24 hours ago
            
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            sessionGr.addQuery('demo_mode', true);
            sessionGr.addQuery('sys_created_on', '<', cutoffTime);
            sessionGr.query();
            
            while (sessionGr.next()) {
                var sessionId = sessionGr.getValue('sys_id');
                
                // Delete votes first
                var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
                voteGr.addQuery('session', sessionId);
                voteGr.deleteMultiple();
                
                // Delete session stories
                var storyGr = new GlideRecord('x_902080_planningw_session_stories');
                storyGr.addQuery('session', sessionId);
                storyGr.deleteMultiple();
                
                // Delete participants
                var participantGr = new GlideRecord('x_902080_planningw_session_participant');
                participantGr.addQuery('session', sessionId);
                participantGr.deleteMultiple();
                
                // Delete session
                sessionGr.deleteRecord();
                deletedCount++;
            }
            
            gs.info('[DemoSessionAjax] Cleaned up ' + deletedCount + ' demo sessions');
            
            return this._buildResponse(true, 'Demo sessions cleaned up', {
                deletedCount: deletedCount
            });
            
        } catch (e) {
            gs.error('[DemoSessionAjax] cleanupDemoSessions error: ' + e);
            return this._buildResponse(false, 'Error cleaning up demo sessions: ' + e, null);
        }
    },
    
    resetDemoSession: function() {
        try {
            var sessionId = this.getParameter('session_id');
            
            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }
            
            var userId = gs.getUserID();
            
            // Check session exists and is demo
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }
            
            if (sessionGr.getValue('demo_mode') != 'true') {
                return this._buildResponse(false, 'Can only reset demo sessions', null);
            }
            
            // Check permissions
            var security = new PlanningPokerSecurity();
            if (!security.canManageSession(sessionGr, userId)) {
                return this._buildResponse(false, 'You do not have permission to reset this session', null);
            }
            
            // Reset session to initial state
            sessionGr.setValue('status', 'ready');
            sessionGr.setValue('current_story', '');
            sessionGr.setValue('active_presenter', '');
            sessionGr.update();
            
            // Delete all votes
            var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
            voteGr.addQuery('session', sessionId);
            voteGr.deleteMultiple();
            
            // Reset all stories to pending
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            storyGr.addQuery('session', sessionId);
            storyGr.query();
            
            while (storyGr.next()) {
                storyGr.setValue('status', 'pending');
                storyGr.setValue('story_points', '');
                storyGr.setValue('vote_count', 0);
                storyGr.setValue('times_revoted', 0);
                storyGr.setValue('voting_started', '');
                storyGr.setValue('voting_completed', '');
                storyGr.setValue('is_current_story', false);
                storyGr.setValue('dealer_comments', '');
                storyGr.update();
            }
            
            return this._buildResponse(true, 'Demo session reset successfully', null);
            
        } catch (e) {
            gs.error('[DemoSessionAjax] resetDemoSession error: ' + e);
            return this._buildResponse(false, 'Error resetting demo session: ' + e, null);
        }
    },
    
    // Helper methods
    _createDemoParticipants: function(sessionId) {
        var participants = [];
        
        // Get some real users from the system to use as demo participants
        var userGr = new GlideRecord('sys_user');
        userGr.addQuery('active', true);
        userGr.addQuery('sys_id', '!=', gs.getUserID()); // Exclude current user
        userGr.orderBy('name');
        userGr.setLimit(5);
        userGr.query();
        
        var roleIndex = 0;
        var roles = ['voter', 'voter', 'voter', 'dealer', 'spectator'];
        
        while (userGr.next()) {
            var userId = userGr.getValue('sys_id');
            var role = roles[roleIndex % roles.length];
            
            this._createParticipant(sessionId, userId, role, false);
            
            participants.push({
                userId: userId,
                name: userGr.getValue('name'),
                role: role
            });
            
            roleIndex++;
        }
        
        return participants;
    },
    
    _createParticipant: function(sessionId, userId, role, isPresenter) {
        var participantGr = new GlideRecord('x_902080_planningw_session_participant');
        participantGr.initialize();
        participantGr.setValue('session', sessionId);
        participantGr.setValue('user', userId);
        participantGr.setValue('role', role);
        participantGr.setValue('status', 'active');
        participantGr.setValue('joined_at', new GlideDateTime());
        participantGr.setValue('is_presenter', isPresenter);
        participantGr.setValue('is_online', true);
        participantGr.insert();
    },
    
    _createDemoStories: function(sessionId) {
        var stories = [];
        var demoStoryData = [
            {
                title: 'User Login Authentication',
                description: 'Implement secure user login with multi-factor authentication support.',
                criteria: 'Given a user with valid credentials, when they log in, then they should be authenticated and redirected to dashboard.'
            },
            {
                title: 'Shopping Cart Functionality',
                description: 'Allow users to add, remove, and modify items in their shopping cart.',
                criteria: 'Users can add items, see cart total, modify quantities, and proceed to checkout.'
            },
            {
                title: 'Email Notification System',
                description: 'Send automated email notifications for key user actions and system events.',
                criteria: 'System sends emails for account creation, password resets, and order confirmations.'
            },
            {
                title: 'Advanced Search Feature',
                description: 'Implement full-text search with filters and sorting capabilities.',
                criteria: 'Users can search by keywords, apply filters, and sort results by relevance or date.'
            },
            {
                title: 'Data Export Feature',
                description: 'Allow users to export data in multiple formats (CSV, PDF, Excel).',
                criteria: 'Users can select data range and export format, receive download link via email.'
            }
        ];
        
        for (var i = 0; i < demoStoryData.length; i++) {
            var storyData = demoStoryData[i];
            
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            storyGr.initialize();
            storyGr.setValue('session', sessionId);
            storyGr.setValue('story_number', 'DEMO-' + (i + 1));
            storyGr.setValue('story_title', storyData.title);
            storyGr.setValue('story_description', storyData.description);
            storyGr.setValue('acceptance_criteria', storyData.criteria);
            storyGr.setValue('status', 'pending');
            storyGr.setValue('order', i + 1);
            storyGr.setValue('vote_count', 0);
            storyGr.setValue('times_revoted', 0);
            
            var storyId = storyGr.insert();
            stories.push(storyId);
        }
        
        return stories;
    },
    
    _createDemoVotes: function(sessionId, storyId, participants) {
        // Create some sample votes for the first story to show voting in action
        var demoVotes = ['3', '5', '5', '8', '?'];
        var voteUtils = new PlanningPokerVoteUtils();
        
        for (var i = 0; i < participants.length && i < demoVotes.length; i++) {
            var participant = participants[i];
            
            // Only create votes for voters and dealers
            if (participant.role === 'voter' || participant.role === 'dealer') {
                var voteValue = demoVotes[i];
                var numericValue = voteUtils.getNumericPoints(voteValue);
                
                var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
                voteGr.initialize();
                voteGr.setValue('session', sessionId);
                voteGr.setValue('story', storyId);
                voteGr.setValue('voter', participant.userId);
                voteGr.setValue('vote_value', voteValue);
                voteGr.setValue('vote_numeric_value', numericValue);
                voteGr.setValue('vote_time', new GlideDateTime());
                voteGr.insert();
            }
        }
        
        // Update story vote count
        var storyGr = new GlideRecord('x_902080_planningw_session_stories');
        if (storyGr.get(storyId)) {
            storyGr.setValue('vote_count', Math.min(demoVotes.length, participants.length));
            storyGr.setValue('status', 'voting'); // Set to voting so it shows as active
            storyGr.setValue('voting_started', new GlideDateTime());
            storyGr.update();
            
            // Set as current story
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (sessionGr.get(sessionId)) {
                sessionGr.setValue('current_story', storyId);
                sessionGr.update();
            }
        }
    },
    
    _generateSessionCode: function() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var code = 'DEMO-';
        for (var i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },
    
    _buildResponse: function(success, message, data) {
        return {
            success: success,
            message: message,
            data: data
        };
    },

    type: 'DemoSessionAjax'
});