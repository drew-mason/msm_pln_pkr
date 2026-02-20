import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_test_runner'],
    name: 'PlanningPokerTestRunner',
    script: Now.include('../../server/script-includes/PlanningPokerTestRunner.js'),
    clientCallable: true,
    active: true
})