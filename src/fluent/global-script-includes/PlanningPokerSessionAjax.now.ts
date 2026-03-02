import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const PlanningPokerSessionAjax = ScriptInclude({
    $id: Now.ID['pp_session_ajax'],
    name: 'PlanningPokerSessionAjax',
    apiName: 'PlanningPokerSessionAjax',
    script: Now.include('../../server/script-includes/PlanningPokerSessionAjax.js'),
    clientCallable: true
})