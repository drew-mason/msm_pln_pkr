import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { autoUpdateSessionStatus } from '../../server/auto-update-session-status.js'

// Auto Update Session Status - Updates session status when stories are completed
export const autoUpdateSessionStatusBR = BusinessRule({
    $id: Now.ID['auto_update_session_status'],
    name: 'Auto Update Session Status',
    table: 'x_902080_planningw_session_stories',
    when: 'async',
    action: ['update'],
    condition: "current.status.changes() || current.story_points.changes()",
    script: autoUpdateSessionStatus,
    order: 100,
    active: true,
    description: 'Updates session status to completed when all stories are in final states'
})