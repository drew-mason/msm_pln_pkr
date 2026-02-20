import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_story_ajax'],
    name: 'PlanningPokerStoryAjax',
    script: Now.include('../../server/script-includes/PlanningPokerStoryAjax.js'),
    clientCallable: true,
    active: true
})