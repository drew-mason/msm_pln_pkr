import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

export const planning_poker_amb_channel = Record({
    $id: Now.ID['planning_poker_amb_channel'],
    table: 'sys_amb_channel',
    data: {
        name: 'Planning Poker Session Channel',
        channel_name: '/x_902080_planningw/session/*',
        can_subscribe: 'gs.isLoggedIn()',
        can_publish: 'gs.isLoggedIn()',
        active: true,
        description: 'Planning Poker real-time session updates channel'
    }
})
