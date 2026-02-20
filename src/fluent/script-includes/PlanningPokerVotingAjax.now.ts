import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_voting_ajax'],
    name: 'PlanningPokerVotingAjax',
    script: Now.include('../../server/script-includes/PlanningPokerVotingAjax.js'),
    clientCallable: true,
    active: true
})