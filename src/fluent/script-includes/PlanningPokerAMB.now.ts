import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_amb'],
    name: 'PlanningPokerAMB',
    script: Now.include('../../server/script-includes/PlanningPokerAMB.js'),
    clientCallable: false,
    active: true
})
