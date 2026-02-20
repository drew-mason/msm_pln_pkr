import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_ajax'],
    name: 'PlanningPokerAjax',
    script: Now.include('../../server/script-includes/PlanningPokerAjax.js'),
    clientCallable: true,
    active: true
})