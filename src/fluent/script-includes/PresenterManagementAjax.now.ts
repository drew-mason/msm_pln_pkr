import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_presenter_management_ajax'],
    name: 'PresenterManagementAjax',
    script: Now.include('../../server/script-includes/PresenterManagementAjax.js'),
    clientCallable: true,
    active: true
})