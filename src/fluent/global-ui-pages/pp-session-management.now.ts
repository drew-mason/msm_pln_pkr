import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import sessionManagement from '../../client/session-management.html'

export const pp_session_management = UiPage({
    $id: Now.ID['pp_session_management'],
    endpoint: 'pp_session_management.do',
    description: 'Planning Poker Session Management Dashboard',
    category: 'general',
    html: sessionManagement,
    direct: true
})