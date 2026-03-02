import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const PlanningPokerSecurity = ScriptInclude({
    $id: Now.ID['pp_security'],
    name: 'PlanningPokerSecurity',
    apiName: 'PlanningPokerSecurity',
    script: Now.include('../../server/script-includes/PlanningPokerSecurity.js'),
    clientCallable: false
})