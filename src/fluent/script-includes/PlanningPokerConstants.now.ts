import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_constants'],
    name: 'PlanningPokerConstants',
    script: Now.include('../../server/script-includes/PlanningPokerConstants.js'),
    clientCallable: false,
    active: true
})
