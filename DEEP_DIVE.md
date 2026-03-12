# Planning Poker — Deep Dive

## Table of Contents

1. [What Is This Application?](#1-what-is-this-application)
2. [Directory and File Structure](#2-directory-and-file-structure)
3. [Tech Stack and Dependencies](#3-tech-stack-and-dependencies)
4. [Data Models and Schemas](#4-data-models-and-schemas)
5. [Key Features and Functionality](#5-key-features-and-functionality)
6. [AJAX API Reference](#6-ajax-api-reference)
7. [Real-Time Architecture (AMB)](#7-real-time-architecture-amb)
8. [Business Logic and Algorithms](#8-business-logic-and-algorithms)
9. [User Flows and Entry Points](#9-user-flows-and-entry-points)
10. [Build, Deploy, and Test](#10-build-deploy-and-test)
11. [Configuration Reference](#11-configuration-reference)
12. [Security Model](#12-security-model)

---

## 1. What Is This Application?

**Planning Poker** (`x_902080_planningw`) is a real-time collaborative **Agile story estimation tool** built as a scoped ServiceNow application. It enables development teams to run structured planning poker sessions entirely within their ServiceNow instance.

### Core Concept

Planning poker is an Agile estimation technique where each team member independently selects a card value representing their effort estimate for a story. Cards are revealed simultaneously to surface disagreements and drive discussion toward consensus. This application automates the entire ceremony:

- A **dealer** (facilitator) creates a session, adds stories from the backlog, and controls the voting lifecycle.
- **Voters** join via a session code, cast hidden votes, and see results only after the dealer reveals them.
- **Spectators** may observe sessions in read-only mode (configurable per session).
- All state changes propagate to every connected browser in real time via ServiceNow's Async Message Bus (AMB).
- When the dealer locks a final estimate, it is written back to the story record and the session advances automatically.

### Primary Use Cases

| Use Case | Description |
|----------|-------------|
| **Sprint Planning** | Estimate user stories before a sprint for velocity tracking |
| **Backlog Refinement** | Async or synchronous story sizing sessions |
| **Remote Teams** | Distributed estimation without video-call card games |
| **Training / Demo** | One-click demo sessions with pre-populated participants and votes |
| **Retrospective Analysis** | Session statistics show consensus patterns, outliers, and team performance over time |

---

## 2. Directory and File Structure

> **Note:** The repository root directory is `msm_pln_pkr` (the GitHub repo name). The ServiceNow application scope is `x_902080_planningw`, which is used as the prefix on all table names, script names, and roles inside the instance. These two identifiers refer to the same codebase at different layers.

```
msm_pln_pkr/
├── src/
│   ├── fluent/                                  # ServiceNow SDK declarative TypeScript modules
│   │   ├── tables/                              # Database table definitions (7 tables)
│   │   │   ├── planning-session.now.ts          # Main session record (extends task)
│   │   │   ├── session-stories.now.ts           # Stories within a session
│   │   │   ├── planning-vote.now.ts             # Individual votes cast by users
│   │   │   ├── session-participant.now.ts       # Participants and their roles
│   │   │   ├── scoring-method.now.ts            # Scoring scale definitions
│   │   │   ├── scoring-value.now.ts             # Individual values in a scale
│   │   │   └── session-voter-groups.now.ts      # Group-based voter restrictions
│   │   ├── business-rules/                      # Automated triggers on table changes
│   │   │   ├── auto-update-session-status.now.ts  # Updates counters; auto-completes session
│   │   │   └── session-state-manager.now.ts       # Session state lifecycle management
│   │   ├── script-includes/                     # Server-side AJAX processors (14 modules)
│   │   │   ├── PlanningPokerAjax.now.ts         # Main router — delegates to sub-processors
│   │   │   ├── PlanningPokerSessionAjax.now.ts  # Session retrieval and voting status
│   │   │   ├── PlanningPokerVotingAjax.now.ts   # Vote cast, reveal, and reset
│   │   │   ├── PlanningPokerStoryAjax.now.ts    # Story management and auto-advance
│   │   │   ├── PlanningPokerSecurity.now.ts     # Authorization helpers
│   │   │   ├── PlanningPokerVoteUtils.now.ts    # Vote statistics calculations
│   │   │   ├── PlanningPokerAMB.now.ts          # Real-time push notifications
│   │   │   ├── PlanningPokerConstants.now.ts    # Shared constants and enums
│   │   │   ├── SessionManagementAjax.now.ts     # Create / update sessions
│   │   │   ├── SessionParticipantAjax.now.ts    # Join / leave session handling
│   │   │   ├── SessionStatisticsAjax.now.ts     # Analytics and performance data
│   │   │   ├── PresenterManagementAjax.now.ts   # Presenter role transitions
│   │   │   ├── DemoSessionAjax.now.ts           # Demo / test session creation
│   │   │   ├── PermissionsAdminAjax.now.ts      # Role grant / revoke utilities
│   │   │   └── PlanningPokerTestRunner.now.ts   # Built-in test execution framework
│   │   ├── ui-pages/                            # ServiceNow UI page declarations (4 pages)
│   │   │   ├── voting_interface.now.ts
│   │   │   ├── session_management.now.ts
│   │   │   ├── join.now.ts
│   │   │   └── session_statistics.now.ts
│   │   ├── roles/                               # Application role definitions
│   │   ├── modules/                             # Navigation module definitions
│   │   ├── records/                             # Seed / default data
│   │   │   ├── scoring-methods.now.ts           # Pre-configured scoring methods
│   │   │   └── amb-channel.now.ts               # AMB channel configuration
│   │   ├── application-menus/                   # Navigation menu configuration
│   │   ├── generated/                           # Auto-generated privilege grants
│   │   └── index.now.ts                         # Central export index
│   │
│   ├── html/
│   │   └── ui-pages/                            # Raw HTML with Jelly templating (4 files)
│   │       ├── voting_interface.html.html        # "Bridge Console" — main voting UI (~3,000 lines)
│   │       ├── session_management.html.html      # "Command Deck" — dealer controls (~3,000 lines)
│   │       ├── join.html.html                    # "Docking Bay" — join by session code (~600 lines)
│   │       └── session_statistics.html.html      # Analytics dashboard
│   │
│   └── server/                                  # Compiled JavaScript output (from fluent/)
│       ├── script-includes/                     # 15 compiled .js files
│       ├── auto-update-session-status.js
│       ├── session-state-manager.js
│       └── tsconfig.json                        # TypeScript compiler configuration
│
├── package.json                                 # npm manifest; build scripts
├── now.config.json                              # ServiceNow SDK configuration
├── .eslintrc                                    # ESLint rules (ServiceNow SDK plugin)
├── AGENTS.md                                    # AI agent instructions
└── BUILDER_AGENT_PROMPT.md                      # Original build specifications
```

**Approximate size:** ~5,800 lines of server-side GlideScript, ~6,600 lines of HTML/CSS/client JS, 47 TypeScript module files.

---

## 3. Tech Stack and Dependencies

### Languages

| Layer | Language / Engine |
|-------|------------------|
| Server-side logic | GlideScript (ServiceNow's JavaScript, Rhino ES5) |
| SDK declarations | TypeScript (`.now.ts`) compiled to `.js` by `now-sdk` |
| UI templates | HTML5 + Jelly (ServiceNow templating language) |
| Client-side scripts | Plain ES5 JavaScript (embedded in HTML pages) |
| Styling | CSS3 with custom Sci-Fi theme and keyframe animations |

> **Important:** ServiceNow's Rhino JavaScript engine targets **ES5**. All server-side code avoids `const`, `let`, arrow functions, template literals, destructuring, and other ES6+ syntax.

### npm Dependencies

```json
{
  "devDependencies": {
    "@servicenow/sdk": "4.2.0",
    "@servicenow/glide": "26.0.1",
    "eslint": "8.50.0",
    "@servicenow/eslint-plugin-sdk-app-plugin": "4.2.0"
  }
}
```

### ServiceNow Platform APIs Used

| API | Purpose |
|-----|---------|
| `GlideRecord` | ORM for all database reads and writes |
| `GlideAggregate` | SQL-style aggregation (COUNT, MIN, MAX, AVG) |
| `GlideAMBManager` | Async Message Bus — server-to-browser WebSocket push |
| `AbstractAjaxProcessor` | Base class for all AJAX endpoint processors |
| Business Rules | Async/synchronous triggers on table row changes |
| UI Pages | Custom page rendering with Jelly markup |
| Scoped Roles | RBAC via `gs.hasRole()` checks |

---

## 4. Data Models and Schemas

### Entity Relationship Overview

```
Scoring Method ──< Scoring Value

Planning Session (extends task)
  ├── dealer            → sys_user
  ├── facilitator       → sys_user
  ├── scoring_method    → Scoring Method
  ├── current_story     → Session Stories
  ├──< Session Stories
  │       ├── story     → rm_story (optional)
  │       ├── presenter → sys_user
  │       └──< Planning Vote
  │               └── voter → sys_user
  ├──< Session Participant
  │       └── user      → sys_user
  └──< Session Voter Groups
          └── voter_group → sys_user_group
```

### Table Definitions

#### `x_902080_planningw_planning_session` (extends `task`)

| Column | Type | Description |
|--------|------|-------------|
| `name` | String | Session display name |
| `description` | String | Free-text description |
| `status` | Choice | `ready` / `live` / `completed` / `cancelled` |
| `session_code` | String(20) | Unique join code shared with participants |
| `dealer` | Reference(sys_user) | Session owner and facilitator |
| `facilitator` | Reference(sys_user) | Optional secondary facilitator |
| `scoring_method` | Reference | Selected scoring scale |
| `current_story` | Reference(session_stories) | Story currently being voted on |
| `total_stories` | Integer | Counter: total stories in session |
| `stories_voted` | Integer | Counter: stories with at least one vote |
| `stories_completed` | Integer | Counter: stories with locked estimates |
| `stories_skipped` | Integer | Counter: stories marked as skipped |
| `total_votes` | Integer | Counter: all votes cast across all stories |
| `active` | Boolean | Whether session is accepting activity |
| `demo_mode` | Boolean | Session was created as a demo |
| `easy_mode` | Boolean | Simplified UI experience |
| `allow_spectators` | Boolean | Non-participants may view session |

#### `x_902080_planningw_session_stories`

| Column | Type | Description |
|--------|------|-------------|
| `session` | Reference(planning_session) | Parent session (cascade delete) |
| `story` | Reference(rm_story) | Optional Release Management backlog story |
| `story_title` | String | Title (used when no rm_story reference) |
| `story_description` | String | Inline description |
| `acceptance_criteria` | String | Definition of done |
| `status` | Choice | `pending` / `voting` / `revealed` / `completed` / `skipped` |
| `order` | Integer | Presentation order within session |
| `story_points` | String | Final locked estimate (display value) |
| `vote_count` | Integer | Total votes cast for this story |
| `times_revoted` | Integer | How many times votes were reset |
| `dealer_comments` | String | Dealer's estimation notes |
| `voting_started` | DateTime | When first vote was cast |
| `voting_completed` | DateTime | When estimate was locked |
| `is_current_story` | Boolean | Convenience flag for queries |
| `presenter` | Reference(sys_user) | Who is currently presenting this story |

#### `x_902080_planningw_planning_vote`

| Column | Type | Description |
|--------|------|-------------|
| `session` | Reference(planning_session) | Parent session (cascade delete) |
| `story` | Reference(session_stories) | Story this vote belongs to (cascade delete) |
| `voter` | Reference(sys_user) | User who cast the vote |
| `vote_value` | String | Display value (e.g., `"8"`, `"L"`, `"?"`) |
| `vote_numeric_value` | Decimal | Numeric equivalent for statistics |
| `vote_time` | DateTime | When the vote was cast |

#### `x_902080_planningw_session_participant`

| Column | Type | Description |
|--------|------|-------------|
| `session` | Reference(planning_session) | Parent session (cascade delete) |
| `user` | Reference(sys_user) | Participant's user record |
| `role` | Choice | `dealer` / `voter` / `spectator` |
| `status` | Choice | `active` / `left` / `idle` |
| `is_presenter` | Boolean | Currently presenting |
| `is_observer` | Boolean | In observer/spectator mode |
| `is_online` | Boolean | Presence indicator |
| `joined_at` | DateTime | When participant joined |

#### `x_902080_planningw_scoring_method`

| Column | Type | Description |
|--------|------|-------------|
| `name` | String | Method name (e.g., "Fibonacci") |
| `description` | String | Human-readable description |
| `is_default` | Boolean | Pre-selected in session creation UI |

#### `x_902080_planningw_scoring_value`

| Column | Type | Description |
|--------|------|-------------|
| `scoring_method` | Reference(scoring_method) | Parent method (cascade delete) |
| `display_value` | String | What users see on the card (e.g., `"XL"`) |
| `numeric_value` | Decimal | Points mapped to this card for statistics |
| `order` | Integer | Card display order |
| `is_special` | Boolean | Non-numeric card (`?`, `PASS`, `BREAK`) |

#### `x_902080_planningw_session_voter_groups`

| Column | Type | Description |
|--------|------|-------------|
| `session` | Reference(planning_session) | Parent session (cascade delete) |
| `voter_group` | Reference(sys_user_group) | Group whose members may vote |

### Pre-Configured Scoring Methods

| Method | Cards |
|--------|-------|
| **Fibonacci** (default) | 0, 1, 2, 3, 5, 8, 13, 21, 34, ?, Pass |
| **T-Shirt Sizes** | XS, S, M, L, XL, XXL, ?, Pass |
| **Powers of 2** | 0, 1, 2, 4, 8, 16, 32, 64, ?, Pass |
| **Simple** | 1, 2, 3, 4, 5, ?, Pass |

T-shirt sizes map to Fibonacci-adjacent numeric values for statistics:
`XS=1, S=3, M=5, L=8, XL=13, XXL=21, XXXL=34`

---

## 5. Key Features and Functionality

### Session Lifecycle

```
Created (ready)
    │
    ▼  Dealer starts voting on first story
  Live (live)
    │
    ▼  All stories reach terminal state
Completed (completed)   or   Cancelled (cancelled)
```

Status transitions are managed by `session-state-manager.js` (business rule) and the `auto-update-session-status.js` business rule, which automatically marks the session complete when every story is in `completed` or `skipped` status.

### Story Lifecycle

```
pending → voting → revealed → completed
                            ↘ skipped
              ↑_____________↓  (reset votes → back to voting)
```

- **pending**: Added to session, waiting for dealer to start voting.
- **voting**: Dealer started voting; votes are hidden from all participants.
- **revealed**: Dealer revealed votes; all vote values become visible.
- **completed**: Dealer locked an estimate (`story_points` set).
- **skipped**: Dealer bypassed this story without locking an estimate.

### Scoring and Vote Validation

Every vote is validated against the scoring method's allowed values before being stored. Special values (`?`, `PASS`, `BREAK`) are accepted but excluded from numeric statistics. The `PlanningPokerConstants` module maintains a central T-shirt-to-number mapping to ensure consistent statistics across all scoring methods.

### Session Analytics

After a session completes (or at any time), the statistics page presents:

| Metric | Calculation |
|--------|-------------|
| Vote count | Total votes cast (including special) |
| Valid votes | Numeric votes only |
| Min / Max | Lowest and highest numeric votes |
| Median | Middle value of sorted numeric votes |
| Mean | Arithmetic average of numeric votes |
| Mode | Most frequently chosen value |
| Standard deviation | Spread of numeric votes |
| Consensus ratio | Percentage of votes within ±1 of the median |

### Demo Mode

`DemoSessionAjax.createDemoSession()` creates a fully populated session with:
- Multiple sample stories with titles and descriptions
- Fake participant records covering all roles
- Pre-populated votes across several scoring rounds

This is useful for training new team members and testing the UI without requiring a live team.

### Role Summary

| Role | What They Can Do |
|------|-----------------|
| **Dealer** | Create sessions, add/remove stories, start/reveal/reset voting, lock estimates, end session, manage participants |
| **Facilitator** | Secondary dealer-level access for co-facilitation of large sessions |
| **Voter** | View session, cast votes, see revealed results |
| **Spectator** | View-only; cannot vote; controlled by the `allow_spectators` session flag |

---

## 6. AJAX API Reference

All server-side endpoints extend `AbstractAjaxProcessor` and are callable from client-side JavaScript. `PlanningPokerAjax` acts as a **routing layer** — clients can call it for all operations, and it delegates to the appropriate sub-processor. Sub-processors can also be called directly.

### PlanningPokerAjax (router)

| sysparm_name | Delegated To | Description |
|--------------|--------------|-------------|
| `getSession` | PlanningPokerSessionAjax | Retrieve session state |
| `getVotingStatus` | PlanningPokerSessionAjax | Current story + vote counts |
| `startVoting` | PlanningPokerStoryAjax | Begin voting on a story |
| `castVote` | PlanningPokerVotingAjax | Submit a vote value |
| `revealVotes` | PlanningPokerVotingAjax | Flip cards for all participants |
| `resetVotes` | PlanningPokerVotingAjax | Clear votes and return to voting |
| `setStoryPoints` | PlanningPokerStoryAjax | Lock final estimate |
| `completeStory` | PlanningPokerStoryAjax | Mark story complete without pointing |
| `skipStory` | PlanningPokerStoryAjax | Skip story and advance |
| `stopSession` | PlanningPokerStoryAjax | End the entire session |
| `switchToStory` | PlanningPokerStoryAjax | Jump to a specific story |

### SessionManagementAjax

| Method | Description |
|--------|-------------|
| `getScoringMethods` | List available scoring scales |
| `getUserGroups` | List groups for voter restriction |
| `createSession` | Create a new planning session |
| `updateSessionSettings` | Edit session name, scoring method, flags |
| `joinSession` | Validates session code and adds participant |

### SessionParticipantAjax

| Method | Description |
|--------|-------------|
| `joinSession` | Join a session (creates participant record) |
| `leaveSession` | Remove self from session |
| `updateParticipantRole` | Change role of a participant (dealer only) |
| `getParticipants` | List all participants with presence status |

### SessionStatisticsAjax

| Method | Description |
|--------|-------------|
| `getSessionStatistics` | Top-level metrics for a completed session |
| `getStoryStatistics` | Per-story breakdown |
| `getVotingPatterns` | Consensus, outliers, alignment trends |
| `getTeamPerformance` | Participation rate, accuracy, velocity |

### PresenterManagementAjax

| Method | Description |
|--------|-------------|
| `setPresenter` | Assign a participant as current presenter |
| `getPresenterInfo` | Retrieve current presenter and notes |
| `updatePresenterNotes` | Save dealer notes for the current presenter |

### DemoSessionAjax

| Method | Description |
|--------|-------------|
| `createDemoSession` | Create a fully pre-populated demo session |
| `addDemoStories` | Add sample stories to an existing session |

### PermissionsAdminAjax

| Method | Description |
|--------|-------------|
| `grantRole` | Grant an application role to a user |
| `revokeRole` | Remove an application role from a user |
| `listRoles` | List all application roles |

### PlanningPokerTestRunner (admin-only)

| Method | Description |
|--------|-------------|
| `getTestInfo` | List available test suites and cases |
| `executeTests` | Run a test suite (`all`, `core`, `security`, `integration`) |

### Internal Utilities (not directly callable by clients)

| Module | Key Methods |
|--------|------------|
| `PlanningPokerSecurity` | `canAccessSession`, `canManageSession`, `canVote`, `getUserRole`, `hasAdminAccess` |
| `PlanningPokerAMB` | `publishSessionState`, `publishParticipantJoined`, `publishParticipantLeft`, `publishPresenceUpdate` |
| `PlanningPokerVoteUtils` | `calculateVoteSummary`, `getVoteDistribution`, `detectOutliers` |
| `PlanningPokerConstants` | Enums for statuses, roles, T-shirt mappings, validation patterns |

---

## 7. Real-Time Architecture (AMB)

### How It Works

ServiceNow's **Async Message Bus (AMB)** provides a server-push WebSocket channel. Rather than having every client poll the server every second, state changes are broadcast once and received by all subscribers simultaneously.

```
Dealer clicks "Reveal Votes"
       │
       ▼
PlanningPokerVotingAjax.revealVotes()
  ├── Updates story status → "revealed"
  ├── Updates all vote records (makes values readable)
  └── Calls PlanningPokerAMB.publishSessionState()
           │
           ▼
      GlideAMBManager.publish(channel, payload)
           │
           ▼  (WebSocket push to all subscribers)
      ┌─────────────────────────────────┐
      │  /x_902080_planningw/session/   │
      │          {sessionId}            │
      └─────────────────────────────────┘
           │
   ┌───────┼───────┐
   ▼       ▼       ▼
Voter 1  Voter 2  Voter 3
 (cards flip in browser instantly)
```

### AMB Events Published

| Event | Trigger | Payload |
|-------|---------|---------|
| `session_state` | Any vote cast, reveal, reset, story switch | Session status, story info, vote counts |
| `participant_joined` | User successfully joins session | Participant info + role |
| `participant_left` | User leaves session | Participant sys_id |
| `presence_update` | Presence heartbeat | User online/offline status |

### Channel Naming

`/x_902080_planningw/session/{sessionSysId}`

Each session has its own isolated channel. Clients subscribe when they load the voting interface and unsubscribe when they leave or close the tab.

### Fallback Polling

If the WebSocket connection cannot be established (firewall, proxy, etc.), client pages fall back to polling `getVotingStatus` every 2–3 seconds. This ensures functionality in restrictive network environments at the cost of slight latency.

---

## 8. Business Logic and Algorithms

### Vote Statistics (`PlanningPokerVoteUtils.calculateVoteSummary`)

```
Input: array of vote records
  1. Separate numeric votes from special values (?, PASS, BREAK)
  2. Sort numeric values ascending
  3. Calculate:
     - count        = numeric votes only
     - min, max     = first and last of sorted array
     - median       = middle value (or average of two middle values)
     - mean         = sum / count
     - mode         = value appearing most frequently
     - stdDev       = sqrt( sum((x - mean)²) / count )
     - consensusRatio = count(votes within median ± 1) / count
Output: statistics object
```

### Session Auto-Complete (`auto-update-session-status.js`)

This business rule fires asynchronously whenever a story's `status` or `story_points` column changes.

```
Count stories in session by status:
  pending, voting, revealed, completed, skipped

IF (pending + voting + revealed == 0) AND (completed + skipped > 0):
  SET session.status = 'completed'
  SET session.active = false
  PUBLISH completion event via AMB
```

**Key design decision:** Stories in `revealed` status are **not** terminal. The dealer must explicitly lock an estimate (`setStoryPoints`) to move them to `completed`. This prevents accidental session completion when a dealer reveals votes but has not yet decided.

### Story Auto-Advance (`PlanningPokerStoryAjax.setStoryPoints`)

After the dealer locks an estimate:

```
1. SET current story status = 'completed', story_points = value
2. QUERY next pending story (ordered by order ASC)
3. IF next story found:
   a. SET next story.status = 'voting' (optional — dealer can manually start)
   b. SET session.current_story = next story
   c. PUBLISH session state via AMB
4. IF no next story:
   a. Business rule detects all stories complete
   b. Session auto-completes
```

### Authorization (`PlanningPokerSecurity`)

Permission checks follow a tiered hierarchy:

```
1. hasAdminAccess()   → gs.hasRole('admin') or app admin role → GRANT ALL
2. canManageSession() → current user is session.dealer or session.facilitator → GRANT DEALER ACTIONS
3. canVote()          → active participant with role='voter' AND story in 'voting'/'revealed' → GRANT VOTE
4. canAccessSession() → active participant OR (allow_spectators AND voter group check) → GRANT VIEW
```

### Vote Validation Pipeline (`PlanningPokerVotingAjax.castVote`)

```
1. Validate session_id format (32-character hexadecimal sys_id)
2. Query session; confirm session exists and is 'live'
3. Validate story_id format
4. Query story; confirm story belongs to session and is in 'voting' or 'revealed'
5. Validate vote_value against scoring method's allowed values
6. Check canVote() permission
7. Query for existing vote by (session, story, voter)
   IF exists → UPDATE vote_value, vote_time
   IF not found → INSERT new vote record
8. publishSessionState() via AMB
9. Return { success: true, voteValue, numericValue }
```

### T-Shirt Size Numeric Mapping (`PlanningPokerConstants`)

Agile teams using T-shirt sizing still benefit from numeric statistics. The constants module provides a canonical mapping:

```javascript
var TSHIRT_NUMERIC_MAP = {
  'XS': 1, 'S': 3, 'M': 5, 'L': 8,
  'XL': 13, 'XXL': 21, 'XXXL': 34
};
```

This follows the Fibonacci sequence, maintaining proportional spacing between size categories.

---

## 9. User Flows and Entry Points

### Entry Points

| Entry Point | URL / Nav | Description |
|-------------|-----------|-------------|
| Application menu | ServiceNow nav bar → Planning Poker | Top-level module navigation |
| Create session | session_management UI page | Dealer workflow starting point |
| Join by code | join UI page | Voter/spectator entry point with session code |
| Session statistics | session_statistics UI page | Analytics for completed sessions |
| Demo session | `DemoSessionAjax.createDemoSession` | One-click test environment |

### Flow 1: Dealer Creates and Runs a Session

```
Dealer navigates to "Create Session"
  └─ SessionManagementAjax.createSession({
       name, description, scoring_method, allow_spectators, voter_groups
     })
     → Creates planning_session record with status='ready'
     → Creates dealer participant record

Dealer adds stories
  └─ PlanningPokerStoryAjax.addStories([rm_story sys_ids or inline titles])
     → Creates session_stories records with status='pending'

Dealer starts voting on first story
  └─ PlanningPokerStoryAjax.startVoting(story_id)
     → story.status = 'voting'
     → session.status = 'live'
     → publishSessionState()  ← all clients notified

[Voters cast votes]

Dealer reveals votes
  └─ PlanningPokerVotingAjax.revealVotes(story_id)
     → story.status = 'revealed'
     → vote cards become visible
     → publishSessionState()

Dealer reviews distribution and locks estimate
  └─ PlanningPokerStoryAjax.setStoryPoints(story_id, points)
     → story.status = 'completed'
     → story.story_points = points
     → session.current_story advances to next pending
     → publishSessionState()

[Repeat for remaining stories]

After last story completes:
  → auto-update-session-status fires
  → session.status = 'completed'
  → session.active = false
```

### Flow 2: Voter Joins and Casts a Vote

```
Voter receives session code from dealer
  └─ Navigates to join.html.html
     → Enters session code
     → SessionParticipantAjax.joinSession(session_code)
        → Validates code, creates participant record (role='voter')

Voter's browser loads voting_interface.html.html
  └─ Subscribes to AMB channel for this session
  └─ Starts polling getVotingStatus() as fallback

Story is currently in 'voting' status
  └─ Vote buttons are enabled

Voter clicks "8"
  └─ PlanningPokerVotingAjax.castVote({
       session_id, story_id, vote_value: '8'
     })
     → Validates, stores vote, publishes AMB update
     → All clients see vote count increment

Dealer reveals votes
  └─ AMB push → voter's browser flips cards
  └─ Vote distribution and statistics shown

Dealer locks estimate
  └─ AMB push → voter sees next story load automatically
```

### Flow 3: Viewing Session Analytics

```
Dealer or admin navigates to session_statistics.html.html
  └─ SessionStatisticsAjax.getSessionStatistics(session_id)
     → Returns: total votes, consensus %, duration, participation rate
  └─ SessionStatisticsAjax.getStoryStatistics(session_id)
     → Per-story: points locked, vote distribution, times re-voted
  └─ SessionStatisticsAjax.getVotingPatterns(session_id)
     → Outlier detection, team alignment across all stories
  └─ SessionStatisticsAjax.getTeamPerformance(session_id)
     → Per-voter participation and accuracy metrics
```

### UI Architecture

Each of the four HTML pages follows the same pattern:

```
HTML Page (Jelly template, rendered by ServiceNow)
├── Inline CSS  (Sci-Fi themed; custom animations)
├── HTML structure
└── Inline JavaScript
    ├── Initialization on DOMContentLoaded
    ├── AMB channel subscription
    ├── Fallback polling interval (2–3 s)
    ├── Click handlers → GlideAjax calls
    ├── Response handlers → DOM updates
    └── Real-time animation triggers on state change
```

**Theme:** The UI pages use a Sci-Fi aesthetic with custom color palettes, glowing borders, and flip-card animations for vote reveals. Pages are themed:
- `voting_interface` → "Bridge Console"
- `session_management` → "Command Deck"  
- `join` → "Docking Bay"

---

## 10. Build, Deploy, and Test

### Prerequisites

- Node.js and npm
- ServiceNow SDK CLI (`now-sdk`) — installed via `npm install`
- A ServiceNow instance with the `x_902080_planningw` scope available

### Commands

```bash
# Install all development dependencies
npm install

# Generate TypeScript type definitions for ServiceNow Glide APIs
npm run types          # now-sdk dependencies

# Compile .now.ts declarations to deployable JavaScript
npm run transform      # now-sdk transform

# Build the application artifacts
npm run build          # now-sdk build

# Deploy to the configured ServiceNow instance
npm run deploy         # now-sdk install
```

### Linting

```bash
npx eslint src/
```

ESLint is configured with `@servicenow/eslint-plugin-sdk-app-plugin` which enforces ServiceNow SDK coding standards and catches common Glide API misuse.

### Built-In Tests

The application ships with `PlanningPokerTestRunner`, an admin-only AJAX processor that executes test suites server-side within the ServiceNow instance.

**Running tests via AJAX:**

```javascript
var ga = new GlideAjax('PlanningPokerTestRunner');
ga.addParam('sysparm_name', 'executeTests');
ga.addParam('test_suite', 'all');   // 'all' | 'core' | 'security' | 'integration'
ga.getXML(function(response) {
  console.log(response.responseXML.documentElement.getAttribute('answer'));
});
```

**Available test suites:**

| Suite | Tests | Description |
|-------|-------|-------------|
| `core` | 8 tests | Vote casting, reveal, reset, story lifecycle |
| `security` | 5 tests | Authorization checks for all roles |
| `integration` | 6 tests | Cross-module communication and AMB events |
| `performance` | 3 tests | Load tests (disabled by default) |

---

## 11. Configuration Reference

### `now.config.json`

```json
{
  "scope": "x_902080_planningw",
  "scopeId": "46b4342783c7f650c97cc2d6feaad328",
  "name": "Planningwsis",
  "tsconfigPath": "./src/server/tsconfig.json"
}
```

- **scope**: The application scope prefix used on all table, role, and script names.
- **scopeId**: Internal ServiceNow application sys_id.
- **name**: Internal ServiceNow application display name (`Planningwsis` is the auto-generated name used by the SDK; the user-facing product name is "Planning Poker").
- **tsconfigPath**: Points the SDK to the TypeScript configuration for server-side compilation.

### `src/server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "outDir": "../../dist/server"
  },
  "include": ["./**/*.ts"],
  "exclude": ["**/*.now.ts"]
}
```

- `.now.ts` files are SDK declarations and are excluded from the TypeScript compiler (handled by `now-sdk transform` instead).
- The compiled output lands in `dist/server/` (excluded from source control via `.gitignore`).
- **Important:** The ES2022 target controls TypeScript type-checking and IDE support. The actual scripts deployed to and *executed by* ServiceNow's Rhino engine (the pre-compiled `.js` files in `src/server/`) must be written in **ES5**. The `now-sdk` toolchain handles the necessary transformations.

### `.eslintrc`

Extends `plugin:@servicenow/sdk-app-plugin/recommended` for ServiceNow-specific linting rules, using `latest` ECMAScript parser and `bundler` module resolution.

### AMB Channel (`records/amb-channel.now.ts`)

Declares the AMB channel `/x_902080_planningw/session/{sessionId}` as a ServiceNow record, enabling the platform to authorize client subscriptions through standard role checks.

---

## 12. Security Model

### Application Roles

The application defines custom scoped roles (prefix `x_902080_planningw.`):
- **`user`**: Basic access; can join sessions and vote.
- **`admin`**: Full access; can manage all sessions, grant/revoke roles.

### Row-Level Security

Every AJAX call performs explicit permission checks via `PlanningPokerSecurity` before touching data:

| Check | Condition |
|-------|-----------|
| `canAccessSession` | User is an active participant, OR spectators are allowed and user passes group check |
| `canManageSession` | User is the session `dealer` or `facilitator`, OR has admin role |
| `canVote` | User is an active participant with `role='voter'`, story is in `voting` or `revealed` status |
| `hasAdminAccess` | User has `admin` or `x_902080_planningw.admin` role |

### Input Validation

- **Session and story sys_ids**: Validated against a 32-character hexadecimal pattern before any database query.
- **Vote values**: Cross-checked against the scoring method's allowed values list; unknown values are rejected.
- **Session codes**: Sanitized for length and character set before lookup.

### Voter Group Restrictions

Sessions can optionally restrict voting to members of specific `sys_user_group` records. When voter groups are configured, `canVote` additionally verifies group membership before accepting a vote.

### Spectator Access Control

The `allow_spectators` flag on each session is the gating mechanism for public view access. When `false`, only registered participants (in `session_participant`) can view any session data.
