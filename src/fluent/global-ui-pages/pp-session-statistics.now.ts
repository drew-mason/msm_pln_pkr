import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import sessionStatistics from '../../client/session-statistics.html'

export const pp_session_statistics = UiPage({
    $id: Now.ID['pp_session_statistics'],
    endpoint: 'pp_session_statistics.do',
    description: 'Planning Poker Session Analytics and Statistics',
    category: 'general',
    html: sessionStatistics,
    direct: true
})