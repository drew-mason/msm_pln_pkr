import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['si_session_statistics_ajax'],
    name: 'SessionStatisticsAjax',
    script: Now.include('../../server/script-includes/SessionStatisticsAjax.js'),
    clientCallable: true,
    active: true
})