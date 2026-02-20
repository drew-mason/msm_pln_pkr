import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_session_participant_ajax'],
    name: 'SessionParticipantAjax',
    script: Now.include('../../server/script-includes/SessionParticipantAjax.js'),
    clientCallable: true,
    active: true
})