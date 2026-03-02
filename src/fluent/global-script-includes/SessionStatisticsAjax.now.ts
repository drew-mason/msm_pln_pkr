import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const SessionStatisticsAjax = ScriptInclude({
    $id: Now.ID['pp_stats_ajax'],
    name: 'SessionStatisticsAjax',
    apiName: 'SessionStatisticsAjax',
    script: Now.include('../../server/script-includes/SessionStatisticsAjax.js'),
    clientCallable: true
})