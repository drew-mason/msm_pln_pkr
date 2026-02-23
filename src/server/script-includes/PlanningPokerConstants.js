var PlanningPokerConstants = Class.create();
PlanningPokerConstants.prototype = {
    initialize: function() {},
    type: 'PlanningPokerConstants'
};

// Static properties
PlanningPokerConstants.ROLES = {
    ADMIN: 'x_902080_planningw.admin',
    FACILITATOR: 'x_902080_planningw.facilitator',
    DEALER: 'dealer',
    VOTER: 'voter',
    SPECTATOR: 'spectator'
};

PlanningPokerConstants.STATUS = {
    ACTIVE: 'active',
    REVEALED: 'revealed',
    VOTING: 'voting',
    COMPLETED: 'completed',
    SKIPPED: 'skipped',
    PENDING: 'pending',
    READY: 'ready',
    LIVE: 'live',
    CANCELLED: 'cancelled'
};

PlanningPokerConstants.VOTE_VALUES = {
    PASS: 'PASS',
    BREAK: 'BREAK',
    UNKNOWN: '?',
    TSHIRT_MAP: {
        'XS': 1, 'S': 3, 'M': 5, 'L': 8, 'XL': 13, 'XXL': 21, 'XXXL': 34
    }
};

PlanningPokerConstants.ERRORS = {
    SESSION_ID_REQUIRED: 'Session ID required',
    INVALID_SESSION_FORMAT: 'Invalid session ID format',
    SESSION_NOT_FOUND: 'Session not found',
    ACCESS_DENIED: 'Access denied',
    STORY_NOT_FOUND: 'Story not found',
    STORY_NOT_IN_SESSION: 'Story does not belong to this session',
    PERMISSION_DENIED: 'You do not have permission to perform this action',
    INTERNAL_ERROR: 'An internal error occurred. Please contact support.'
};
