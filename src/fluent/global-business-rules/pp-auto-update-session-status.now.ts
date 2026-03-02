import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { autoUpdateSessionStatus } from '../../server/auto-update-session-status.js'

BusinessRule({
    $id: Now.ID['pp_auto_update_status'],
    name: 'Auto Update Session Status',
    table: 'pp_session_stories',
    when: 'after',
    action: ['update'],
    script: autoUpdateSessionStatus,
    active: true,
    order: 100,
    condition: "current.status.changesTo('completed') || current.status.changesTo('revealed') || current.status.changesTo('skipped') || !current.story_points.nil()",
    asyncRunning: true
})