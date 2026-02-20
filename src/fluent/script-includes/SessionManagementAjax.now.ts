import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_session_management_ajax'],
    name: 'SessionManagementAjax',
    script: Now.include('../../server/script-includes/SessionManagementAjax.js'),
    clientCallable: true,
    active: true
})