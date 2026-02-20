import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_vote_utils'],
    name: 'PlanningPokerVoteUtils',
    script: Now.include('../../server/script-includes/PlanningPokerVoteUtils.js'),
    clientCallable: false,
    active: true
})