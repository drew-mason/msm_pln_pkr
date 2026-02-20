import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_demo_session_ajax'],
    name: 'DemoSessionAjax',
    script: Now.include('../../server/script-includes/DemoSessionAjax.js'),
    clientCallable: true,
    active: true
})