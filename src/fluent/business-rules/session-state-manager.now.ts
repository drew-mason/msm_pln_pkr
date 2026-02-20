import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { sessionStateManager } from '../../server/session-state-manager.js'

BusinessRule({
    $id: Now.ID['br_session_state_manager'],
    name: 'Session State Manager',
    table: 'x_902080_planningw_planning_session',
    when: 'before',
    action: ['update'],
    condition: 'current.status.changes()',
    script: sessionStateManager,
    active: true,
    order: 100
})