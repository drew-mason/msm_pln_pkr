var DemoSessionAjax = Class.create();
DemoSessionAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    createDemoSession: function() {
        try {
            gs.debug('[DemoSessionAjax] Creating demo session');
            
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
            
            gs.debug('[DemoSessionAjax] Demo session created: ' + sessionId);
            
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
            gs.debug('[DemoSessionAjax] Cleaning up demo sessions');
            
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
            
            gs.debug('[DemoSessionAjax] Cleaned up ' + deletedCount + ' demo sessions');
            
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
            if (!security.canManageSession(sessionId, userId)) {
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
    
    _generateSessionCode: function(attempt) {
        attempt = attempt || 0;
        if (attempt >= 10) {
            gs.error('[DemoSessionAjax] Could not generate unique demo session code after 10 attempts');
            return 'DEMO-ERR' + Math.floor(Math.random() * 10);
        }

        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var code = 'DEMO-';
        for (var i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Ensure uniqueness
        var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
        sessionGr.addQuery('session_code', code);
        sessionGr.setLimit(1);
        sessionGr.query();

        if (sessionGr.hasNext()) {
            return this._generateSessionCode(attempt + 1);
        }

        return code;
    },
    
    // ──────────────────────────────────────────────────────────
    //  BOT MANAGEMENT
    // ──────────────────────────────────────────────────────────

    /**
     * Add bot voters to a session.
     * Params: session_id, count (1-10, default 3)
     */
    addBotVoters: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var count = parseInt(this.getParameter('count') || '3', 10);
            if (isNaN(count) || count < 1) count = 1;
            if (count > 10) count = 10;

            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }

            // Admin only
            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required to manage bots', null);
            }

            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }

            var botNames = this._getBotNames();
            var added = [];
            var skipped = 0;

            for (var i = 0; i < count && i < botNames.length; i++) {
                var botInfo = botNames[i];
                var botUserId = this._getOrCreateBotUser(botInfo.username, botInfo.firstName, botInfo.lastName);
                if (!botUserId) { skipped++; continue; }

                // Check if bot already participates
                var existGr = new GlideRecord('x_902080_planningw_session_participant');
                existGr.addQuery('session', sessionId);
                existGr.addQuery('user', botUserId);
                existGr.addQuery('status', 'active');
                existGr.setLimit(1);
                existGr.query();
                if (existGr.hasNext()) { skipped++; continue; }

                this._createParticipant(sessionId, botUserId, 'voter', false);
                added.push(botInfo.firstName + ' ' + botInfo.lastName);
            }

            new PlanningPokerAMB().publishSessionState(sessionId);
            return this._buildResponse(true, 'Bot voters added', {
                added: added,
                addedCount: added.length,
                skippedCount: skipped
            });

        } catch (e) {
            gs.error('[DemoSessionAjax] addBotVoters error: ' + e);
            return this._buildResponse(false, 'Error adding bot voters: ' + e, null);
        }
    },

    /**
     * Add a bot dealer to a session.
     * Params: session_id
     */
    addBotDealer: function() {
        try {
            var sessionId = this.getParameter('session_id');
            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }

            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required to manage bots', null);
            }

            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }

            var dealerBots = this._getBotDealerNames();
            var botInfo = null;

            // Find a dealer bot not already in session
            for (var i = 0; i < dealerBots.length; i++) {
                var candidate = dealerBots[i];
                var candidateId = this._getOrCreateBotUser(candidate.username, candidate.firstName, candidate.lastName);
                if (!candidateId) continue;

                var existGr = new GlideRecord('x_902080_planningw_session_participant');
                existGr.addQuery('session', sessionId);
                existGr.addQuery('user', candidateId);
                existGr.addQuery('status', 'active');
                existGr.setLimit(1);
                existGr.query();
                if (!existGr.hasNext()) {
                    botInfo = candidate;
                    botInfo.userId = candidateId;
                    break;
                }
            }

            if (!botInfo) {
                return this._buildResponse(false, 'All bot dealers already in session', null);
            }

            this._createParticipant(sessionId, botInfo.userId, 'voter', false);

            new PlanningPokerAMB().publishSessionState(sessionId);
            return this._buildResponse(true, 'Bot dealer added', {
                name: botInfo.firstName + ' ' + botInfo.lastName,
                userId: botInfo.userId
            });

        } catch (e) {
            gs.error('[DemoSessionAjax] addBotDealer error: ' + e);
            return this._buildResponse(false, 'Error adding bot dealer: ' + e, null);
        }
    },

    /**
     * Trigger all bot voters to cast random votes on the current story.
     * Params: session_id
     */
    triggerBotVotes: function() {
        try {
            var sessionId = this.getParameter('session_id');
            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }

            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }

            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }

            var currentStoryId = sessionGr.getValue('current_story');
            if (!currentStoryId) {
                return this._buildResponse(false, 'No current story to vote on', null);
            }

            // Verify story is in voting state
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            if (!storyGr.get(currentStoryId)) {
                return this._buildResponse(false, 'Current story not found', null);
            }
            if (storyGr.getValue('status') !== 'voting') {
                return this._buildResponse(false, 'Story is not in voting state', null);
            }

            // Get scoring values for this session
            var scoringValues = this._getSessionScoringValues(sessionGr.getValue('scoring_method'));
            if (scoringValues.length === 0) {
                return this._buildResponse(false, 'No scoring values found for session', null);
            }

            // Filter out special values for bot voting (bots vote real numbers)
            var votableValues = [];
            for (var sv = 0; sv < scoringValues.length; sv++) {
                if (!scoringValues[sv].isSpecial) {
                    votableValues.push(scoringValues[sv]);
                }
            }
            if (votableValues.length === 0) {
                votableValues = scoringValues; // fallback to all values
            }

            // Find all bot participants who haven't voted yet
            var botParticipants = this._getBotParticipantsInSession(sessionId);
            var voteUtils = new PlanningPokerVoteUtils();
            var votedCount = 0;
            var skippedCount = 0;

            for (var i = 0; i < botParticipants.length; i++) {
                var botUserId = botParticipants[i].userId;

                // Check if already voted
                var existingVote = new GlideRecord('x_902080_planningw_planning_vote');
                existingVote.addQuery('story', currentStoryId);
                existingVote.addQuery('voter', botUserId);
                existingVote.setLimit(1);
                existingVote.query();
                if (existingVote.hasNext()) {
                    skippedCount++;
                    continue;
                }

                // Pick random vote value
                var randomIndex = Math.floor(Math.random() * votableValues.length);
                var voteValue = votableValues[randomIndex].displayValue;
                var numericValue = voteUtils.getNumericPoints(voteValue);

                // Create vote record
                var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
                voteGr.initialize();
                voteGr.setValue('session', sessionId);
                voteGr.setValue('story', currentStoryId);
                voteGr.setValue('voter', botUserId);
                voteGr.setValue('vote_value', voteValue);
                voteGr.setValue('vote_numeric_value', numericValue);
                voteGr.setValue('vote_time', new GlideDateTime());
                voteGr.insert();
                votedCount++;
            }

            // Update story vote count
            var totalVoteGa = new GlideAggregate('x_902080_planningw_planning_vote');
            totalVoteGa.addQuery('story', currentStoryId);
            totalVoteGa.addAggregate('COUNT');
            totalVoteGa.query();
            var totalVotes = 0;
            if (totalVoteGa.next()) {
                totalVotes = parseInt(totalVoteGa.getAggregate('COUNT'), 10);
            }
            storyGr.setValue('vote_count', totalVotes);
            storyGr.update();

            new PlanningPokerAMB().publishSessionState(sessionId);
            return this._buildResponse(true, 'Bot votes cast', {
                votedCount: votedCount,
                skippedCount: skippedCount,
                totalVotes: totalVotes
            });

        } catch (e) {
            gs.error('[DemoSessionAjax] triggerBotVotes error: ' + e);
            return this._buildResponse(false, 'Error triggering bot votes: ' + e, null);
        }
    },

    /**
     * Bot dealer adds random stories to the session queue.
     * Params: session_id, count (1-10, default 3)
     */
    triggerBotStories: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var count = parseInt(this.getParameter('count') || '3', 10);
            if (isNaN(count) || count < 1) count = 1;
            if (count > 10) count = 10;

            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }

            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }

            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (!sessionGr.get(sessionId)) {
                return this._buildResponse(false, 'Session not found', null);
            }

            // Find the bot dealer in this session (pick any bot participant)
            var botDealerId = null;
            var botParticipants = this._getBotParticipantsInSession(sessionId);
            if (botParticipants.length > 0) {
                botDealerId = botParticipants[0].userId;
            } else {
                // If no bots exist, use the calling admin's ID
                botDealerId = gs.getUserID();
            }

            // Get next order number
            var maxOrderGa = new GlideAggregate('x_902080_planningw_session_stories');
            maxOrderGa.addQuery('session', sessionId);
            maxOrderGa.addAggregate('MAX', 'order');
            maxOrderGa.query();
            var nextOrder = 1;
            if (maxOrderGa.next()) {
                var maxOrder = parseInt(maxOrderGa.getAggregate('MAX', 'order'), 10);
                if (!isNaN(maxOrder)) nextOrder = maxOrder + 1;
            }

            var botStories = this._getBotStoryTemplates();
            var added = [];

            for (var i = 0; i < count; i++) {
                var storyTemplate = botStories[i % botStories.length];
                var storyNumber = 'BOT-' + nextOrder;

                var storyGr = new GlideRecord('x_902080_planningw_session_stories');
                storyGr.initialize();
                storyGr.setValue('session', sessionId);
                storyGr.setValue('story_number', storyNumber);
                storyGr.setValue('story_title', storyTemplate.title);
                storyGr.setValue('story_description', storyTemplate.description);
                storyGr.setValue('acceptance_criteria', storyTemplate.criteria || '');
                storyGr.setValue('status', 'pending');
                storyGr.setValue('order', nextOrder);
                storyGr.setValue('vote_count', 0);
                storyGr.setValue('times_revoted', 0);
                storyGr.setValue('added_by', botDealerId);
                storyGr.insert();

                added.push({ number: storyNumber, title: storyTemplate.title });
                nextOrder++;
            }

            new PlanningPokerAMB().publishSessionState(sessionId);
            return this._buildResponse(true, 'Bot stories added', {
                addedCount: added.length,
                stories: added
            });

        } catch (e) {
            gs.error('[DemoSessionAjax] triggerBotStories error: ' + e);
            return this._buildResponse(false, 'Error adding bot stories: ' + e, null);
        }
    },

    /**
     * Remove all bots from a session.
     * Params: session_id
     */
    removeBots: function() {
        try {
            var sessionId = this.getParameter('session_id');
            if (!sessionId) {
                return this._buildResponse(false, 'Session ID required', null);
            }

            if (!gs.hasRole('x_902080_planningw.admin') && !gs.hasRole('admin')) {
                return this._buildResponse(false, 'Admin access required', null);
            }

            var botParticipants = this._getBotParticipantsInSession(sessionId);
            var removedCount = 0;

            for (var i = 0; i < botParticipants.length; i++) {
                // Delete participant
                var partGr = new GlideRecord('x_902080_planningw_session_participant');
                partGr.addQuery('session', sessionId);
                partGr.addQuery('user', botParticipants[i].userId);
                partGr.query();
                while (partGr.next()) {
                    partGr.deleteRecord();
                    removedCount++;
                }

                // Delete their votes in this session
                var voteGr = new GlideRecord('x_902080_planningw_planning_vote');
                voteGr.addQuery('session', sessionId);
                voteGr.addQuery('voter', botParticipants[i].userId);
                voteGr.deleteMultiple();
            }

            new PlanningPokerAMB().publishSessionState(sessionId);
            return this._buildResponse(true, 'Bots removed', {
                removedCount: removedCount
            });

        } catch (e) {
            gs.error('[DemoSessionAjax] removeBots error: ' + e);
            return this._buildResponse(false, 'Error removing bots: ' + e, null);
        }
    },

    // ──────────────────────────────────────────────────────────
    //  BOT HELPER METHODS
    // ──────────────────────────────────────────────────────────

    _getOrCreateBotUser: function(username, firstName, lastName) {
        // Check if bot user already exists
        var userGr = new GlideRecord('sys_user');
        userGr.addQuery('user_name', username);
        userGr.setLimit(1);
        userGr.query();

        if (userGr.next()) {
            return userGr.getValue('sys_id');
        }

        // Create new bot user (inactive so they can't log in)
        var newUser = new GlideRecord('sys_user');
        newUser.initialize();
        newUser.setValue('user_name', username);
        newUser.setValue('first_name', firstName);
        newUser.setValue('last_name', lastName);
        newUser.setValue('active', false);
        newUser.setValue('locked_out', true);
        newUser.setValue('title', 'Planning Poker Bot');
        newUser.setValue('email', username + '@bot.planningpoker.local');
        var sysId = newUser.insert();

        if (!sysId) {
            gs.warn('[DemoSessionAjax] Failed to create bot user: ' + username);
        }
        return sysId;
    },

    _getBotParticipantsInSession: function(sessionId) {
        var bots = [];
        var partGr = new GlideRecord('x_902080_planningw_session_participant');
        partGr.addQuery('session', sessionId);
        partGr.addQuery('status', 'active');
        partGr.query();

        while (partGr.next()) {
            var userId = partGr.getValue('user');
            var userGr = new GlideRecord('sys_user');
            if (userGr.get(userId)) {
                var userName = userGr.getValue('user_name') || '';
                if (userName.indexOf('ppbot_') === 0) {
                    bots.push({
                        participantId: partGr.getValue('sys_id'),
                        userId: userId,
                        name: userGr.getValue('name'),
                        role: partGr.getValue('role')
                    });
                }
            }
        }
        return bots;
    },

    _getBotNames: function() {
        return [
            { username: 'ppbot_alpha', firstName: 'Droid', lastName: 'Alpha' },
            { username: 'ppbot_beta', firstName: 'Droid', lastName: 'Beta' },
            { username: 'ppbot_gamma', firstName: 'Droid', lastName: 'Gamma' },
            { username: 'ppbot_delta', firstName: 'Droid', lastName: 'Delta' },
            { username: 'ppbot_epsilon', firstName: 'Droid', lastName: 'Epsilon' },
            { username: 'ppbot_zeta', firstName: 'Droid', lastName: 'Zeta' },
            { username: 'ppbot_eta', firstName: 'Droid', lastName: 'Eta' },
            { username: 'ppbot_theta', firstName: 'Droid', lastName: 'Theta' },
            { username: 'ppbot_iota', firstName: 'Droid', lastName: 'Iota' },
            { username: 'ppbot_kappa', firstName: 'Droid', lastName: 'Kappa' }
        ];
    },

    _getBotDealerNames: function() {
        return [
            { username: 'ppbot_commander', firstName: 'Droid', lastName: 'Commander' },
            { username: 'ppbot_admiral', firstName: 'Droid', lastName: 'Admiral' },
            { username: 'ppbot_captain', firstName: 'Droid', lastName: 'Captain' }
        ];
    },

    _getSessionScoringValues: function(methodId) {
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

        // Fallback to CSV values
        if (values.length === 0) {
            var methodGr = new GlideRecord('x_902080_planningw_scoring_method');
            if (methodGr.get(methodId)) {
                var csvValues = methodGr.getValue('values');
                if (csvValues) {
                    var parts = csvValues.split(',');
                    var specialValues = ['?', 'Pass', 'PASS', 'Break', 'BREAK'];
                    for (var i = 0; i < parts.length; i++) {
                        var val = parts[i].trim();
                        if (!val) continue;
                        values.push({
                            displayValue: val,
                            numericValue: !isNaN(parseFloat(val)) ? parseFloat(val) : null,
                            isSpecial: specialValues.indexOf(val) > -1
                        });
                    }
                }
            }
        }

        return values;
    },

    _getBotStoryTemplates: function() {
        return [
            {
                title: 'Implement user authentication flow',
                description: 'Build secure login and registration with token-based auth, password reset, and session management.',
                criteria: 'Users can register, log in, reset password, and maintain session across tabs.'
            },
            {
                title: 'Dashboard analytics widget',
                description: 'Create a real-time analytics dashboard displaying key performance metrics with charts and filters.',
                criteria: 'Dashboard loads in under 2s, supports date range filters, and exports to CSV.'
            },
            {
                title: 'Notification engine overhaul',
                description: 'Redesign the notification system to support email, SMS, push, and in-app channels with user preferences.',
                criteria: 'Users can configure per-channel preferences. Notifications are delivered within 30 seconds.'
            },
            {
                title: 'Search and filter optimization',
                description: 'Optimize search indexing and add advanced filters including date ranges, tags, and full-text search.',
                criteria: 'Search results return in under 500ms. Filters are combinable and persist across sessions.'
            },
            {
                title: 'API rate limiting and throttling',
                description: 'Implement rate limiting per API key with configurable thresholds and graceful degradation.',
                criteria: 'Rate limits are enforced per key. Exceeded requests receive 429 with retry-after header.'
            },
            {
                title: 'Bulk data import pipeline',
                description: 'Build a pipeline for importing large CSV/Excel files with validation, progress tracking, and rollback.',
                criteria: 'Files up to 100MB supported. Import progress is visible. Failed rows are reported.'
            },
            {
                title: 'Role-based access control matrix',
                description: 'Define and enforce RBAC with hierarchical roles, resource permissions, and audit logging.',
                criteria: 'Roles cascade permissions. All access checks are logged. Admin can modify roles in UI.'
            },
            {
                title: 'Mobile responsive layout refactor',
                description: 'Refactor the main application layout to be fully responsive with touch-friendly controls.',
                criteria: 'All views usable on 320px+ screens. Touch targets are minimum 44px. No horizontal scroll.'
            },
            {
                title: 'Automated regression test suite',
                description: 'Create an end-to-end regression test suite covering critical user journeys.',
                criteria: 'Suite covers login, CRUD operations, search, and export. Runs in CI in under 10 minutes.'
            },
            {
                title: 'Data archival and purge strategy',
                description: 'Implement configurable data retention policies with archival to cold storage and scheduled purges.',
                criteria: 'Records older than retention period are archived. Purge runs nightly. Restore is possible.'
            }
        ];
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

    type: 'DemoSessionAjax'
});