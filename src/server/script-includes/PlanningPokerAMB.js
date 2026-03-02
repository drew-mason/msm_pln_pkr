var PlanningPokerAMB = Class.create();
PlanningPokerAMB.prototype = {

    CHANNEL_PREFIX: '/x_902080_planningw/session/',

    getChannel: function(sessionId) {
        return this.CHANNEL_PREFIX + sessionId;
    },

    publishSessionState: function(sessionId) {
        try {
            var payload = this._buildVotingStatusPayload(sessionId);
            if (!payload) {
                return;
            }
            payload.topic = 'session_state';
            this._publish(sessionId, payload);
        } catch (e) {
            gs.error('[PlanningPokerAMB] publishSessionState error: ' + e);
        }
    },

    publishParticipantJoined: function(sessionId, userId, name, role) {
        try {
            this._publish(sessionId, {
                topic: 'participant_joined',
                userId: userId,
                name: name,
                role: role
            });
        } catch (e) {
            gs.error('[PlanningPokerAMB] publishParticipantJoined error: ' + e);
        }
    },

    publishParticipantLeft: function(sessionId, userId) {
        try {
            this._publish(sessionId, {
                topic: 'participant_left',
                userId: userId
            });
        } catch (e) {
            gs.error('[PlanningPokerAMB] publishParticipantLeft error: ' + e);
        }
    },

    publishPresenceUpdate: function(sessionId, userId, isOnline) {
        try {
            this._publish(sessionId, {
                topic: 'presence_update',
                userId: userId,
                isOnline: isOnline
            });
        } catch (e) {
            gs.error('[PlanningPokerAMB] publishPresenceUpdate error: ' + e);
        }
    },

    _publish: function(sessionId, payload) {
        var channel = this.getChannel(sessionId);
        var ambManager = new GlideAMBManager();
        ambManager.publish(channel, JSON.stringify(payload));
    },

    _buildVotingStatusPayload: function(sessionId) {
        var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
        if (!sessionGr.get(sessionId)) {
            return null;
        }

        var sessionAjax = new PlanningPokerSessionAjax();
        var currentStory = sessionAjax._getCurrentStory(sessionId);

        if (!currentStory) {
            return {
                hasCurrentStory: false,
                sessionStatus: sessionGr.getValue('status'),
                participants: sessionAjax._getParticipants(sessionId, null, sessionGr)
            };
        }

        var participants = sessionAjax._getParticipants(sessionId, currentStory.sys_id, sessionGr);
        var totalVoteCount = sessionAjax._getTotalVoteCount(currentStory.sys_id);

        return {
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
    },

    type: 'PlanningPokerAMB'
};
