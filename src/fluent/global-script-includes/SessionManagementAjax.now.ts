import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const SessionManagementAjax = ScriptInclude({
    $id: Now.ID['pp_session_mgmt_ajax'],
    name: 'SessionManagementAjax',
    apiName: 'SessionManagementAjax',
    script: Now.include('../../server/script-includes/SessionManagementAjax.js'),
    clientCallable: true
})