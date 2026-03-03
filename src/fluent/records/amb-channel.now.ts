import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

export const planning_poker_amb_channel = Record({
    $id: Now.ID['planning_poker_amb_channel'],
    table: 'glide_amb_config',
    data: {
        channel_name: '/x_902080_planningw/session',
        supports_pattern: true,
        active: true,
        description: 'Planning Poker real-time session updates channel',
        can_subscribe: 'gs.isLoggedIn()'
    }
})
