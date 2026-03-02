import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const PlanningPokerVoteUtils = ScriptInclude({
    $id: Now.ID['pp_vote_utils'],
    name: 'PlanningPokerVoteUtils',
    apiName: 'PlanningPokerVoteUtils',
    script: Now.include('../../server/script-includes/PlanningPokerVoteUtils.js'),
    clientCallable: false
})