import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const PlanningPokerStoryAjax = ScriptInclude({
    $id: Now.ID['pp_story_ajax'],
    name: 'PlanningPokerStoryAjax',
    apiName: 'PlanningPokerStoryAjax',
    script: Now.include('../../server/script-includes/PlanningPokerStoryAjax.js'),
    clientCallable: true
})