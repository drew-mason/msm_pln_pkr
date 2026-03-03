# ServiceNow Builder Agent Prompt — Planning Poker Application (Global Scope)

---

## OVERVIEW

Build a **Planning Poker** application in the **global scope** of this ServiceNow instance. This is a real-time agile story estimation tool that allows teams to run collaborative planning poker sessions. Users join a session by code, vote on stories, and the dealer reveals and locks estimates. The application uses **AMB (Arden Message Bus)** for real-time push updates so all participants stay in sync without polling.

> **Important:** All artifacts must be created in the **global scope** (not a scoped application). All table names, role names, and script include names use the prefix `x_pln_pkr_`.

---

## STEP 1 — CREATE AN UPDATE SET

Create a new Update Set named **"Feature: Planning Poker Application"** before doing any development work. Use `auto_switch=true` so all changes are automatically tracked.

---

## STEP 2 — TABLES (7 tables)

Create the following custom tables. All tables should have **public access** and support create, read, update, and delete operations for authorized users.

---

### Table 1: `x_pln_pkr_scoring_method` — Scoring Method

Label: **Scoring Method**

| Column Name | Type | Label | Notes |
|---|---|---|---|
| `name` | String (100) | Method Name | Mandatory |
| `values` | String (500) | Values (comma-separated) | Mandatory |
| `is_default` | Boolean | Default Method | Default: false |
| `active` | Boolean | Active | Default: true |
| `allow_custom_values` | Boolean | Allow Custom Values | Default: false |

---

### Table 2: `x_pln_pkr_scoring_value` — Scoring Value

Label: **Scoring Value**

| Column Name | Type | Label | Notes |
|---|---|---|---|
| `scoring_method` | Reference → `x_pln_pkr_scoring_method` | Scoring Method | Mandatory, cascade delete |
| `display_value` | String (20) | Display Value | Mandatory |
| `numeric_value` | Decimal | Numeric Equivalent | |
| `order` | Integer | Sort Order | Default: 100 |
| `is_special` | Boolean | Special Value (?, Pass, Break) | Default: false |

---

### Table 3: `x_pln_pkr_planning_session` — Planning Session

Label: **Planning Session**  
**Extends: `task`** (this table extends the ServiceNow `task` table)

| Column Name | Type | Label | Notes |
|---|---|---|---|
| `name` | String (100) | Session Name | Mandatory |
| `description` | String (1000) | Description | |
| `status` | Choice | Status | Choices: `ready` (Ready), `live` (Live), `completed` (Completed), `cancelled` (Cancelled). Default: `ready`. Dropdown without none. |
| `session_code` | String (20) | Session Code | Mandatory |
| `dealer` | Reference → `sys_user` | Dealer | Mandatory |
| `facilitator` | Reference → `sys_user` | Facilitator | |
| `active_presenter` | Reference → `sys_user` | Active Presenter | |
| `scoring_method` | Reference → `x_pln_pkr_scoring_method` | Scoring Method | Mandatory |
| `dealer_group` | Reference → `sys_user_group` | Dealer Group | |
| `allow_spectators` | Boolean | Allow Spectators | Default: true |
| `easy_mode` | Boolean | Easy Mode | Default: false |
| `demo_mode` | Boolean | Demo Mode | Default: false |
| `current_story` | Reference → `x_pln_pkr_session_stories` | Current Story | |
| `total_stories` | Integer | Total Stories | Default: 0, Read-only |
| `stories_voted` | Integer | Stories Voted | Default: 0, Read-only |
| `stories_completed` | Integer | Stories Completed | Default: 0, Read-only |
| `stories_skipped` | Integer | Stories Skipped | Default: 0, Read-only |
| `total_votes` | Integer | Total Votes | Default: 0, Read-only |
| `active` | Boolean | Active | Default: true |

---

### Table 4: `x_pln_pkr_session_stories` — Session Stories

Label: **Session Stories**

| Column Name | Type | Label | Notes |
|---|---|---|---|
| `session` | Reference → `x_pln_pkr_planning_session` | Session | Mandatory, cascade delete |
| `story` | Reference → `rm_story` | Story | Optional |
| `story_number` | String (40) | Story Number (Fallback) | |
| `story_title` | String (200) | Story Title (Fallback) | |
| `story_description` | String (4000) | Story Description (Fallback) | |
| `acceptance_criteria` | String (4000) | Acceptance Criteria (Fallback) | |
| `status` | Choice | Status | Choices: `pending` (Pending), `voting` (Voting), `revealed` (Revealed), `completed` (Completed), `skipped` (Skipped). Default: `pending`. Dropdown without none. |
| `order` | Integer | Display Order | Default: 100 |
| `story_points` | String (10) | Final Story Points | |
| `vote_count` | Integer | Vote Count | Default: 0, Read-only |
| `times_revoted` | Integer | Times Revoted | Default: 0 |
| `session_count` | Integer | Session Count | Default: 1 |
| `voting_started` | DateTime | Voting Started | |
| `voting_completed` | DateTime | Voting Completed | |
| `is_current_story` | Boolean | Current Story | Default: false |
| `dealer_comments` | String (1000) | Dealer Comments | |

---

### Table 5: `x_pln_pkr_planning_vote` — Planning Vote

Label: **Planning Vote**

| Column Name | Type | Label | Notes |
|---|---|---|---|
| `session` | Reference → `x_pln_pkr_planning_session` | Session | Mandatory, cascade delete |
| `story` | Reference → `x_pln_pkr_session_stories` | Story | Mandatory, cascade delete |
| `voter` | Reference → `sys_user` | Voter | Mandatory |
| `vote_value` | String (20) | Vote Value | Mandatory |
| `vote_numeric_value` | Decimal | Numeric Vote Value | |
| `vote_time` | DateTime | Vote Time | Mandatory |
| `is_final_vote` | Boolean | Final Vote | Default: false |

---

### Table 6: `x_pln_pkr_session_participant` — Session Participant

Label: **Session Participant**

| Column Name | Type | Label | Notes |
|---|---|---|---|
| `session` | Reference → `x_pln_pkr_planning_session` | Session | Mandatory, cascade delete |
| `user` | Reference → `sys_user` | User | Mandatory |
| `role` | Choice | Role | Choices: `dealer` (Dealer), `voter` (Voter), `spectator` (Spectator). Default: `voter`. Dropdown without none. |
| `status` | Choice | Status | Choices: `active` (Active), `left` (Left), `idle` (Idle). Default: `active`. Dropdown without none. |
| `joined_at` | DateTime | Joined At | Mandatory |
| `is_presenter` | Boolean | Is Presenter | Default: false |
| `is_observer` | Boolean | Is Observer | Default: false |
| `is_online` | Boolean | Is Online | Default: true |

---

### Table 7: `x_pln_pkr_session_voter_groups` — Session Voter Groups

Label: **Session Voter Groups**

| Column Name | Type | Label | Notes |
|---|---|---|---|
| `session` | Reference → `x_pln_pkr_planning_session` | Session | Mandatory, cascade delete |
| `voter_group` | Reference → `sys_user_group` | Voter Group | Mandatory |

---

## STEP 3 — ROLES (5 roles)

Create the following application roles. Role names use dot notation with the app prefix.

| Role Name | Description | Elevated | Contains |
|---|---|---|---|
| `x_pln_pkr.voter` | Can participate in sessions and cast votes | No | — |
| `x_pln_pkr.spectator` | Can view sessions but cannot vote | No | — |
| `x_pln_pkr.dealer` | Can create and facilitate estimation sessions | No | — |
| `x_pln_pkr.facilitator` | Co-facilitator — can manage any session | No | Contains `x_pln_pkr.dealer` |
| `x_pln_pkr.admin` | Full access — manage all sessions, scoring methods, and app configuration | No | Contains `x_pln_pkr.facilitator` |

All roles should be grantable and delegatable.

---

## STEP 4 — SCRIPT INCLUDES (13 script includes)

All script includes must be written in **ES5-compatible JavaScript** (no `const`, `let`, arrow functions, template literals, or destructuring). They extend `global.AbstractAjaxProcessor` where noted.

---

### 4.1 `PlanningPokerConstants` — Constants singleton (NOT client-callable)

```javascript
var PlanningPokerConstants = Class.create();
PlanningPokerConstants.prototype = {
    initialize: function() {},
    type: 'PlanningPokerConstants'
};

PlanningPokerConstants.ROLES = {
    ADMIN: 'x_pln_pkr.admin',
    FACILITATOR: 'x_pln_pkr.facilitator',
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
```

---

### 4.2 `PlanningPokerSecurity` — Authorization utility (NOT client-callable)

Provides methods: `canAccessSession(sessionId, userId)`, `canManageSession(sessionId, userId)`, `canVote(sessionId, userId)`, `getUserRole(sessionId, userId)`, `isSessionDealer(sessionGr, userId)`, `hasAdminAccess(userId)`, `hasAppRole(userId, roles)`.

Logic:
- Admin role always has full access
- `canAccessSession`: checks if user is the dealer, has an active participant record, or if spectators are allowed
- `canManageSession`: checks if user is dealer, facilitator, or has `dealer` participant role
- `canVote`: checks `canAccessSession` and that participant role is `dealer` or `voter`
- `getUserRole`: returns effective role — checks explicit participant record first, then falls back to session dealer, then global roles
- `hasAdminAccess`: checks if user has `x_pln_pkr.admin` or `x_pln_pkr.facilitator` role
- `hasAppRole`: checks if user has any role in a given list via `gs.hasRole`

```javascript
var PlanningPokerSecurity = Class.create();
PlanningPokerSecurity.prototype = {
    initialize: function() {},

    canAccessSession: function(sessionId, userId) {
        try {
            userId = userId || gs.getUserID();
            if (!sessionId || !userId) return false;
            if (this.hasAdminAccess(userId)) return true;
            var sessionGr = new GlideRecord('x_pln_pkr_planning_session');
            if (!sessionGr.get(sessionId)) return false;
            if (this.isSessionDealer(sessionGr, userId)) return true;
            var participantGr = new GlideRecord('x_pln_pkr_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.addQuery('status', 'active');
            participantGr.query();
            if (participantGr.next()) return true;
            if (sessionGr.getValue('allow_spectators') === 'true') return true;
            return this.hasAppRole(userId, [
                'x_pln_pkr.admin', 'x_pln_pkr.facilitator',
                'x_pln_pkr.dealer', 'x_pln_pkr.voter', 'x_pln_pkr.spectator'
            ]);
        } catch (e) {
            gs.error('[PlanningPokerSecurity] canAccessSession error: ' + String(e.message));
            return false;
        }
    },

    canManageSession: function(sessionId, userId) {
        try {
            userId = userId || gs.getUserID();
            if (!sessionId || !userId) return false;
            if (this.hasAdminAccess(userId)) return true;
            var sessionGr = new GlideRecord('x_pln_pkr_planning_session');
            if (!sessionGr.get(sessionId)) return false;
            if (this.isSessionDealer(sessionGr, userId)) return true;
            var partGr = new GlideRecord('x_pln_pkr_session_participant');
            partGr.addQuery('session', sessionId);
            partGr.addQuery('user', userId);
            partGr.addQuery('role', 'dealer');
            partGr.setLimit(1);
            partGr.query();
            return partGr.next();
        } catch (e) {
            gs.error('[PlanningPokerSecurity] canManageSession error: ' + String(e.message));
            return false;
        }
    },

    isSessionDealer: function(sessionGr, userId) {
        userId = userId || gs.getUserID();
        if (this.hasAdminAccess(userId)) return true;
        return (sessionGr.getValue('dealer') === userId || sessionGr.getValue('facilitator') === userId);
    },

    canVote: function(sessionId, userId) {
        try {
            if (!this.canAccessSession(sessionId, userId)) return false;
            var roleData = this.getUserRole(sessionId, userId);
            return (roleData.role === 'dealer' || roleData.role === 'voter');
        } catch (e) {
            gs.error('[PlanningPokerSecurity] canVote error: ' + String(e.message));
            return false;
        }
    },

    getUserRole: function(sessionId, userId) {
        try {
            userId = userId || gs.getUserID();
            var participantGr = new GlideRecord('x_pln_pkr_session_participant');
            participantGr.addQuery('session', sessionId);
            participantGr.addQuery('user', userId);
            participantGr.setLimit(1);
            participantGr.query();
            if (participantGr.next()) {
                var role = participantGr.getValue('role');
                if (role && role.indexOf('.') > -1) { role = role.split('.').pop(); }
                return { role: role, source: 'participant' };
            }
            var sessionGr = new GlideRecord('x_pln_pkr_planning_session');
            if (sessionGr.get(sessionId)) {
                if (sessionGr.getValue('dealer') === userId) return { role: 'dealer', source: 'session_dealer' };
                if (sessionGr.getValue('facilitator') === userId) return { role: 'dealer', source: 'session_facilitator' };
            }
            if (gs.hasRole('x_pln_pkr.admin')) return { role: 'dealer', source: 'global_role' };
            if (gs.hasRole('x_pln_pkr.voter')) return { role: 'voter', source: 'global_role' };
            if (gs.hasRole('x_pln_pkr.spectator')) return { role: 'spectator', source: 'global_role' };
            return { role: 'spectator', source: 'default' };
        } catch (e) {
            gs.error('[PlanningPokerSecurity] getUserRole error: ' + String(e.message));
            return { role: 'spectator', source: 'error' };
        }
    },

    hasAdminAccess: function(userId) {
        userId = userId || gs.getUserID();
        return (gs.hasRole('x_pln_pkr.admin') || gs.hasRole('x_pln_pkr.facilitator') || gs.hasRole('admin'));
    },

    hasAppRole: function(userId, roles) {
        for (var i = 0; i < roles.length; i++) {
            if (gs.hasRole(roles[i])) return true;
        }
        return false;
    },

    type: 'PlanningPokerSecurity'
};
```

---

### 4.3 `PlanningPokerVoteUtils` — Vote calculation utilities (NOT client-callable)

Provides: `getNumericPoints(voteValue)`, `calculateStatistics(votes)`, `getMajorityVote(votes)`.

- `getNumericPoints`: parses numeric from vote value string; handles T-shirt sizes (XS=1, S=3, M=5, L=8, XL=13, XXL=21, XXXL=34); returns null for non-numeric values like `?` or `Pass`
- `calculateStatistics`: given an array of `{value, numeric_value}` vote objects, returns `{min, max, average, median, mode, hasConsensus, suggestedPoints}`
- `getMajorityVote`: finds the most common numeric vote value

---

### 4.4 `PlanningPokerAMB` — Real-time AMB publisher (NOT client-callable)

Uses `GlideAMBManager` to publish real-time messages to the channel `/x_pln_pkr/session/{sessionId}`.

Methods:
- `getChannel(sessionId)` — returns the channel path
- `publishSessionState(sessionId)` — builds full voting status payload and publishes with `topic: 'session_state'`
- `publishParticipantJoined(sessionId, userId, name, role)` — publishes `topic: 'participant_joined'`
- `publishParticipantLeft(sessionId, userId)` — publishes `topic: 'participant_left'`
- `publishPresenceUpdate(sessionId, userId, isOnline)` — publishes `topic: 'presence_update'`

The voting status payload includes: `hasCurrentStory`, `storyId`, `storyStatus`, `storyTitle`, `storyDescription`, `acceptanceCriteria`, `dealerComments`, `sessionStatus`, `participants` (array with hasVoted indicator but without revealing vote values until revealed), `totalVoteCount`.

```javascript
var PlanningPokerAMB = Class.create();
PlanningPokerAMB.prototype = {
    CHANNEL_PREFIX: '/x_pln_pkr/session/',
    getChannel: function(sessionId) { return this.CHANNEL_PREFIX + sessionId; },
    publishSessionState: function(sessionId) {
        try {
            var payload = this._buildVotingStatusPayload(sessionId);
            if (!payload) return;
            payload.topic = 'session_state';
            this._publish(sessionId, payload);
        } catch (e) { gs.error('[PlanningPokerAMB] publishSessionState error: ' + e); }
    },
    publishParticipantJoined: function(sessionId, userId, name, role) {
        try { this._publish(sessionId, { topic: 'participant_joined', userId: userId, name: name, role: role }); }
        catch (e) { gs.error('[PlanningPokerAMB] publishParticipantJoined error: ' + e); }
    },
    publishParticipantLeft: function(sessionId, userId) {
        try { this._publish(sessionId, { topic: 'participant_left', userId: userId }); }
        catch (e) { gs.error('[PlanningPokerAMB] publishParticipantLeft error: ' + e); }
    },
    publishPresenceUpdate: function(sessionId, userId, isOnline) {
        try { this._publish(sessionId, { topic: 'presence_update', userId: userId, isOnline: isOnline }); }
        catch (e) { gs.error('[PlanningPokerAMB] publishPresenceUpdate error: ' + e); }
    },
    _publish: function(sessionId, payload) {
        var channel = this.getChannel(sessionId);
        var ambManager = new GlideAMBManager();
        ambManager.publish(channel, JSON.stringify(payload));
    },
    _buildVotingStatusPayload: function(sessionId) { /* delegate to PlanningPokerSessionAjax helpers */ },
    type: 'PlanningPokerAMB'
};
```

---

### 4.5 `PlanningPokerSessionAjax` — Session data retrieval (client-callable, extends AbstractAjaxProcessor)

Public methods exposed as GlideAjax calls:
- `getSession()` — returns full session state: session metadata, currentStory, storyQueue, participants, scoringValues, userRole, revealedVotes (only if story is `revealed`)
- `getVotingStatus()` — returns lightweight polling data: hasCurrentStory, storyId/status/title/description, sessionStatus, participants (with `hasVoted` boolean per participant, no vote values), totalVoteCount

Internal helpers (used by PlanningPokerAMB too):
- `_validateAndLoadSession()` — validates `session_id` parameter (32-char hex), loads GlideRecord, checks `PlanningPokerSecurity.canAccessSession`
- `_getCurrentStory(sessionId)` — returns current story data object from `current_story` field
- `_getStoryQueue(sessionId)` — returns ordered array of pending/voting stories
- `_getParticipants(sessionId, storyId, sessionGr)` — returns participant array with `{sys_id, userId, name, role, status, isOnline, hasVoted}`. `hasVoted` is only populated if storyId is provided.
- `_getScoringValues(scoringMethodId)` — returns array of `{display_value, numeric_value, is_special, order}` from `x_pln_pkr_scoring_value`; falls back to parsing CSV from scoring_method.values
- `_getUserRoleData(sessionId, userId, sessionGr)` — delegates to `PlanningPokerSecurity.getUserRole`
- `_getRevealedVotes(storyId)` — returns full vote array with voter names and values (only called when story status is `revealed`)
- `_getTotalVoteCount(storyId)` — returns integer count of votes for a story
- `_buildSessionInfo(sessionGr)` — returns flat object with session field values
- `_buildResponse(success, message, data)` — returns JSON string `{"success":bool,"message":"...","data":...}`

---

### 4.6 `PlanningPokerVotingAjax` — Vote casting and reveal (client-callable, extends AbstractAjaxProcessor)

Methods:
- `castVote()` — parameters: `session_id`, `story_id`, `vote_value`. Validates format, checks `PlanningPokerSecurity.canVote`, validates vote_value against scoring method (tries `scoring_value` records first, falls back to CSV parsing), upserts `planning_vote` record, publishes AMB event.
- `revealVotes()` — parameters: `session_id`, `story_id`. Requires `canManageSession`. Sets story status to `revealed`. Publishes AMB event with full revealed vote set.
- `resetVotes()` — parameters: `session_id`, `story_id`. Requires `canManageSession`. Deletes all votes for story, resets story status to `voting`, increments `times_revoted`. Publishes AMB.
- `_buildResponse(success, message, data)` — shared response builder

---

### 4.7 `PlanningPokerStoryAjax` — Story lifecycle (client-callable, extends AbstractAjaxProcessor)

Methods:
- `startVoting()` — `session_id`, `story_id`. Requires `canManageSession`. Sets story status to `voting`, sets `voting_started`, sets `is_current_story=true`, updates other stories' `is_current_story=false`, sets session `current_story`, transitions session from `ready` → `live` if needed. Publishes AMB.
- `setStoryPoints()` — `session_id`, `story_id`, `story_points`, optional `work_notes`. Requires `canManageSession`. Sets story `story_points`, status to `completed`, `voting_completed`. Updates linked `rm_story.story_points` if present. Builds vote log work note. Publishes AMB.
- `completeStory()` — marks story `completed` without points
- `skipStory()` — marks story `skipped`, sets `voting_completed`
- `stopSession()` — sets session status to `completed`, sets `active=false`
- `prevStory()` / `nextStory()` — navigate story queue by `order`
- `addStory()` — creates ad-hoc story in session without `rm_story` link
- `removeStory()` — deletes a `session_stories` record if not voted
- `_validateStoryAction(sessionId, storyId)` — validates both IDs, loads GlideRecords, checks `canManageSession`
- `_buildVoteLog(storyId, sessionId, finalPoints)` — builds formatted work note string with all voter names and values

---

### 4.8 `SessionManagementAjax` — Session creation and management (client-callable, extends AbstractAjaxProcessor)

Methods:
- `getScoringMethods()` — returns active scoring methods ordered by name
- `getUserGroups()` — returns active user groups (limit 100)
- `createSession()` — params: `session_name`, `description`, `scoring_method` (sys_id), `allow_spectators`, `easy_mode`. Creates `planning_session` record with auto-generated unique 6-char alphanumeric session code (uppercase). Creates dealer participant record. Returns `{sessionId, sessionCode}`.
- `getActiveSessions()` — returns sessions the current user can access (dealer, participant, or admin)
- `updateSession()` — update session metadata (name, description, scoring method, options)
- `deleteSession()` — soft-delete (set `active=false`) if user is dealer or admin
- `_generateSessionCode()` — generates 6-char uppercase alphanumeric code, ensuring uniqueness against existing active sessions
- `_hasCreatePermission()` — checks for `x_pln_pkr.dealer`, `x_pln_pkr.facilitator`, or `x_pln_pkr.admin` role
- `_sanitizeString(value, maxLength)` — trims and caps string length
- `_isValidSysId(id)` — validates 32-char hex format
- `_buildResponse(success, message, data)` — JSON response builder

---

### 4.9 `SessionParticipantAjax` — Join/leave session (client-callable, extends AbstractAjaxProcessor)

Methods:
- `joinSession()` — param: `session_code`. Finds active session by code (case-insensitive), checks session is not completed/cancelled, upserts participant record with role determined by `_determineJoinRole`. Publishes AMB participant_joined.
- `leaveSession()` — sets participant `status=left`, `is_online=false`. Publishes AMB participant_left.
- `heartbeat()` — params: `session_id`. Updates participant `is_online=true`, used for presence tracking.
- `getParticipants()` — returns participants for a session
- `_determineJoinRole(sessionGr, userId)` — determines role: `dealer` if user is session dealer/facilitator, `spectator` if spectators allowed and user has spectator role, `voter` if user has voter/dealer/facilitator/admin role, `null` if unauthorized

---

### 4.10 `SessionStatisticsAjax` — Session statistics (client-callable, extends AbstractAjaxProcessor)

Methods:
- `getSessionStats()` — param: `session_id`. Returns: total stories, stories by status, total votes, average vote per story, consensus rate, time per story, participant count
- `getStoryStats()` — param: `story_id`, `session_id`. Returns vote distribution, min/max/average/median, consensus details for a specific story
- `getVoteDistribution()` — returns counts per vote value for a story

---

### 4.11 `SessionStatisticsAjax` → `PresenterManagementAjax` — Presenter controls (client-callable, extends AbstractAjaxProcessor)

Name: **PresenterManagementAjax**

Methods:
- `promoteToPresenter()` — params: `session_id`, `user_id`. Requires `canManageSession`. Sets `is_presenter=true` for target participant, `is_presenter=false` for all others in session. Updates `active_presenter` on session.
- `demotePresenter()` — resets `active_presenter` and `is_presenter=false` for all participants in session
- `transferDealer()` — params: `session_id`, `target_user_id`. Requires current user is dealer. Updates session `dealer` field and participant roles.

---

### 4.12 `DemoSessionAjax` — Demo/test data generator (client-callable, extends AbstractAjaxProcessor)

Methods:
- `createDemoSession()` — creates a session with `demo_mode=true`, pre-populates 3 sample stories (e.g. "User Login Feature", "Dashboard Widget", "API Integration"), using Fibonacci scoring method
- `simulateVotes()` — params: `session_id`, `story_id`. Simulates random votes from current participants; only works on sessions with `demo_mode=true`

---

### 4.13 `PermissionsAdminAjax` — Admin permissions management (client-callable, extends AbstractAjaxProcessor)

Requires `x_pln_pkr.admin` role for all methods.

Methods:
- `getSessionPermissions()` — returns permission summary for a session
- `updateParticipantRole()` — params: `session_id`, `participant_id`, `new_role`. Updates participant role in session
- `removeParticipant()` — params: `session_id`, `participant_id`. Removes participant record and publishes AMB

---

## STEP 5 — BUSINESS RULES (2 business rules)

All business rule scripts must use **ES5 JavaScript** only.

---

### Business Rule 1: `Auto Update Session Status`

- **Table:** `x_pln_pkr_session_stories`
- **When:** Async
- **Actions:** Update
- **Condition:** `current.status.changes() || current.story_points.changes()`
- **Order:** 100
- **Active:** true
- **Description:** Updates session counters and auto-completes session when all stories reach terminal status (completed/skipped). Revealed stories are NOT terminal.

**Script logic:**
1. Get `sessionId` from `current.getValue('session')`
2. Use `GlideAggregate` on `x_pln_pkr_session_stories` grouped by `status` to count stories per status
3. Count total votes via `GlideAggregate` on `x_pln_pkr_planning_vote` for the session
4. Load the session GlideRecord and update:
   - `total_stories` = sum of all status counts
   - `stories_voted` = completed + skipped count
   - `stories_completed` = completed count
   - `stories_skipped` = skipped count
   - `total_votes` = total vote count
5. If `pending == 0 AND voting == 0 AND revealed == 0 AND total > 0` AND session is not already completed/cancelled → set `status=completed`, `active=false`
6. Call `sessionGr.update()`

```javascript
(function executeRule(current, previous) {
    try {
        var sessionId = current.getValue('session');
        if (!sessionId) return;

        var agg = new GlideAggregate('x_pln_pkr_session_stories');
        agg.addQuery('session', sessionId);
        agg.addAggregate('COUNT', 'status');
        agg.groupBy('status');
        agg.query();

        var statusCounts = {};
        while (agg.next()) {
            statusCounts[agg.getValue('status')] = parseInt(agg.getAggregate('COUNT', 'status'));
        }

        var pendingCount = statusCounts['pending'] || 0;
        var votingCount = statusCounts['voting'] || 0;
        var revealedCount = statusCounts['revealed'] || 0;
        var completedCount = statusCounts['completed'] || 0;
        var skippedCount = statusCounts['skipped'] || 0;
        var totalStories = 0;
        for (var s in statusCounts) { totalStories += statusCounts[s]; }

        var voteAgg = new GlideAggregate('x_pln_pkr_planning_vote');
        voteAgg.addQuery('session', sessionId);
        voteAgg.addAggregate('COUNT');
        voteAgg.query();
        var totalVotes = 0;
        if (voteAgg.next()) { totalVotes = parseInt(voteAgg.getAggregate('COUNT')); }

        var sessionGr = new GlideRecord('x_pln_pkr_planning_session');
        if (sessionGr.get(sessionId)) {
            var currentSessionStatus = sessionGr.getValue('status');
            sessionGr.setValue('total_stories', totalStories);
            sessionGr.setValue('stories_voted', completedCount + skippedCount);
            sessionGr.setValue('stories_completed', completedCount);
            sessionGr.setValue('stories_skipped', skippedCount);
            sessionGr.setValue('total_votes', totalVotes);

            if (pendingCount === 0 && votingCount === 0 && revealedCount === 0 && totalStories > 0) {
                if (currentSessionStatus !== 'completed' && currentSessionStatus !== 'cancelled') {
                    sessionGr.setValue('status', 'completed');
                    sessionGr.setValue('active', false);
                    gs.info('[autoUpdateSessionStatus] Session auto-completed: ' + sessionId);
                }
            }
            sessionGr.update();
        }
    } catch (e) {
        gs.error('[autoUpdateSessionStatus] Error: ' + String(e.message));
    }
})(current, previous);
```

---

### Business Rule 2: `Session State Manager`

- **Table:** `x_pln_pkr_planning_session`
- **When:** Before
- **Actions:** Update
- **Condition:** `current.status.changes()`
- **Order:** 100
- **Active:** true

**Script logic:**
1. Get `newStatus` and `previousStatus` from `current` and `previous`
2. If `newStatus === previousStatus` → return early
3. If `newStatus === 'completed'` → query all stories with status `pending` or `voting` for this session → set each to `skipped` with `dealer_comments = 'Auto-skipped when session was completed'`
4. Log status transitions with `gs.debug`

```javascript
(function executeRule(current, previous) {
    try {
        var sessionId = current.getValue('sys_id');
        var newStatus = current.getValue('status');
        var previousStatus = previous ? previous.getValue('status') : '';

        if (newStatus === previousStatus) return;

        if (newStatus === 'completed') {
            var storyGr = new GlideRecord('x_pln_pkr_session_stories');
            storyGr.addQuery('session', sessionId);
            storyGr.addQuery('status', 'IN', 'pending,voting');
            storyGr.query();
            var skippedCount = 0;
            while (storyGr.next()) {
                storyGr.setValue('status', 'skipped');
                storyGr.setValue('dealer_comments', 'Auto-skipped when session was completed');
                storyGr.update();
                skippedCount++;
            }
            if (skippedCount > 0) {
                gs.debug('[SessionStateManager] Auto-skipped ' + skippedCount + ' stories for session: ' + sessionId);
            }
        }

        if (newStatus === 'cancelled') {
            gs.debug('[SessionStateManager] Session cancelled: ' + current.getValue('name') + ' (ID: ' + sessionId + ')');
        }
    } catch (e) {
        gs.error('[SessionStateManager] Error: ' + String(e));
    }
})(current, previous);
```

---

## STEP 6 — UI PAGES (4 UI pages)

Create the following UI pages. Each is an HTML-based UI page (`.do` endpoint) rendered by the ServiceNow UI Page framework.

---

### UI Page 1: `x_pln_pkr_voting_interface`

- **Endpoint:** `x_pln_pkr_voting_interface.do`
- **Purpose:** Real-time voting interface for participants. Shows current story details, voting cards, participant presence, and handles vote reveal.

**HTML features:**
- Jelly/HTML page that includes a Bootstrap-style card layout
- Displays current story title, description, and acceptance criteria
- Renders voting button cards for each scoring value from the session's scoring method
- Shows participant grid with presence indicators (green/grey dot) and vote status (voted/not voted) without revealing values until revealed
- When story status is `revealed`: shows each participant's vote value and a statistics panel (min, max, average, suggestion)
- "Reveal Votes" button (dealer only)
- "Accept Points" button (dealer only) — calls `setStoryPoints` GlideAjax
- "Re-vote" button (dealer only) — calls `resetVotes` GlideAjax
- "Skip Story" button (dealer only)
- "Next Story" button (dealer only)
- Uses AMB client to subscribe to `/x_pln_pkr/session/{sessionId}` for real-time updates
- On AMB message: updates participant list, vote counts, story status dynamically via JavaScript DOM manipulation
- Calls `PlanningPokerSessionAjax.getSession` on page load via GlideAjax to initialize state
- Calls `PlanningPokerVotingAjax.castVote` when a voting card is clicked

---

### UI Page 2: `x_pln_pkr_session_management`

- **Endpoint:** `x_pln_pkr_session_management.do`
- **Purpose:** Dealer's session creation and management dashboard.

**HTML features:**
- Session creation form: session name, description, scoring method (dropdown), allow spectators toggle, easy mode toggle
- Active sessions list showing session code, name, status, story progress counters
- "Start Session" button — creates session via `SessionManagementAjax.createSession`, then redirects to voting interface
- Story management panel: add stories (title, description, acceptance criteria), reorder stories, remove stories
- Participant list with role and online status
- Session controls: stop session, export results
- Calls `SessionManagementAjax.getScoringMethods` to populate scoring method dropdown
- All server calls via GlideAjax

---

### UI Page 3: `x_pln_pkr_join`

- **Endpoint:** `x_pln_pkr_join.do`
- **Purpose:** Landing page for participants to join a session by entering a 6-character session code.

**HTML features:**
- Large centered card with session code input field (6 chars, auto-uppercase)
- "Join Session" button — calls `SessionParticipantAjax.joinSession`, on success redirects to `voting_interface.do?session_id={id}`
- Error message display for invalid/expired codes
- Shows current user's display name

---

### UI Page 4: `x_pln_pkr_session_statistics`

- **Endpoint:** `x_pln_pkr_session_statistics.do`
- **Purpose:** Post-session statistics and results view.

**HTML features:**
- Session summary header: name, dates, total participants, total stories, total votes
- Stories table: story title/number, final story points, vote count, min/max/average vote, consensus rate, time to estimate
- Exportable results table
- Calls `SessionStatisticsAjax.getSessionStats` and `getStoryStats` for data

---

## STEP 7 — APPLICATION MENU & MODULES

Create an Application Menu (navigator group) named **"Planning Poker"** with the following navigation modules:

| Module Title | Type | Target | Roles |
|---|---|---|---|
| Session Management | DIRECT (URL) | `x_pln_pkr_session_management.do` | admin, dealer, facilitator |
| Join Session | DIRECT (URL) | `x_pln_pkr_join.do` | admin, dealer, facilitator, voter, spectator |
| Sessions | LIST | Table: `x_pln_pkr_planning_session` | admin, dealer, facilitator |
| Scoring Methods | LIST | Table: `x_pln_pkr_scoring_method` | admin |

The Application Menu should be visible to: `x_pln_pkr.admin`, `x_pln_pkr.dealer`, `x_pln_pkr.facilitator`, `x_pln_pkr.voter`.

---

## STEP 8 — AMB CHANNEL CONFIGURATION

Create an AMB (Arden Message Bus) channel configuration record in `glide_amb_config`:

| Field | Value |
|---|---|
| channel_name | `/x_pln_pkr/session` |
| supports_pattern | true |
| active | true |
| description | Planning Poker real-time session updates channel |

This channel uses pattern matching so all session-specific sub-channels (`/x_pln_pkr/session/{sessionId}`) are handled.

---

## STEP 9 — SEED DATA (Scoring Methods)

After creating the tables, insert the following default scoring method records into `x_pln_pkr_scoring_method`:

| Name | Values | Is Default |
|---|---|---|
| Fibonacci | `0,1,2,3,5,8,13,21,34,?,Pass` | **true** |
| T-Shirt Sizing | `XS,S,M,L,XL,XXL,?,Pass` | false |
| Powers of 2 | `0,1,2,4,8,16,32,64,?,Pass` | false |
| Simple | `1,2,3,4,5,?,Pass` | false |

All should be `active=true`, `allow_custom_values=false`.

---

## KEY DESIGN CONSTRAINTS

1. **ES5 only** — all server-side scripts must use `var`, `function(){}` syntax, string concatenation (not template literals), and traditional `for` loops. No `const`, `let`, arrow functions, or destructuring.

2. **Security-first** — every AJAX method that modifies data must validate the requesting user via `PlanningPokerSecurity` before performing any GlideRecord operations.

3. **GlideAjax pattern** — all client→server communication uses `AbstractAjaxProcessor` subclasses with `this.getParameter('...')` for input and `this.newItem('answer')` + answer text for output (or return JSON string from the method).

4. **Response format** — all AJAX methods return JSON: `{"success": true/false, "message": "...", "data": {...}}` serialized as a string via `JSON.stringify`.

5. **Real-time** — any state-changing action (vote, reveal, skip, next story, participant join/leave) must call `PlanningPokerAMB.publishSessionState(sessionId)` after the DB update so all connected clients are notified.

6. **AMB subscriptions** — the voting interface UI page subscribes to the session channel using the ServiceNow AMB client library. On receiving a message it re-renders the participant grid and story state without a page reload.

7. **No polling** — the voting interface should rely on AMB push for real-time updates. GlideAjax `getVotingStatus` is only called on initial page load or after a disconnection/reconnect.

8. **Session code** — always 6 characters, uppercase alphanumeric, unique among active sessions. The join page auto-uppercases input.

9. **Cascade deletes** — reference fields marked `cascadeRule: 'cascade'` ensure child records are deleted when parent is deleted.

10. **rm_story integration** — when `setStoryPoints` is called and the story has a linked `rm_story` record, update that record's `story_points` field with the numeric equivalent.

---

## COMPLETION CHECKLIST

After building, verify:
- [ ] All 7 tables exist with correct columns and relationships
- [ ] All 5 roles exist with correct hierarchy (admin → facilitator → dealer)
- [ ] All 13 script includes are active and accessible
- [ ] Both business rules are active
- [ ] All 4 UI pages load without errors at their `.do` endpoints
- [ ] Application Menu shows in navigator for users with appropriate roles
- [ ] AMB channel configuration record exists
- [ ] 4 default scoring method seed records exist
- [ ] A test user with `x_pln_pkr.dealer` role can create a session, get a code, and another user with `x_pln_pkr.voter` role can join with that code
- [ ] Voting, reveal, and accept points flow completes without errors
- [ ] Session auto-completes when all stories reach terminal status

---

*End of prompt. Build the full application in the global scope as described above.*
