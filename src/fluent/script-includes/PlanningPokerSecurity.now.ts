import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_planning_poker_security'],
    name: 'PlanningPokerSecurity',
    script: Now.include('../../server/script-includes/PlanningPokerSecurity.js'),
    clientCallable: false,
    active: true
})