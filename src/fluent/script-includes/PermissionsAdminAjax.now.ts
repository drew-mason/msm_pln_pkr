import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_permissions_admin_ajax'],
    name: 'PermissionsAdminAjax',
    script: Now.include('../../server/script-includes/PermissionsAdminAjax.js'),
    clientCallable: true,
    active: true
})