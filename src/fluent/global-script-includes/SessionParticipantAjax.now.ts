import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const SessionParticipantAjax = ScriptInclude({
    $id: Now.ID['pp_participant_ajax'],
    name: 'SessionParticipantAjax',
    apiName: 'SessionParticipantAjax',
    script: Now.include('../../server/script-includes/SessionParticipantAjax.js'),
    clientCallable: true
})