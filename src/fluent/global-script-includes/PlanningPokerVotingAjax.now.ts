import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const PlanningPokerVotingAjax = ScriptInclude({
    $id: Now.ID['pp_voting_ajax'],
    name: 'PlanningPokerVotingAjax',
    apiName: 'PlanningPokerVotingAjax',
    script: Now.include('../../server/script-includes/PlanningPokerVotingAjax.js'),
    clientCallable: true
})