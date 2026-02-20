import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_session_ajax'],
    name: 'PlanningPokerSessionAjax',
    script: Now.include('../../server/script-includes/PlanningPokerSessionAjax.js'),
    clientCallable: true,
    active: true
})