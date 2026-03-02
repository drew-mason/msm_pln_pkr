import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const PlanningPokerAjax = ScriptInclude({
    $id: Now.ID['pp_ajax_main'],
    name: 'PlanningPokerAjax',
    apiName: 'PlanningPokerAjax',
    script: Now.include('../../server/script-includes/PlanningPokerAjax.js'),
    clientCallable: true
})