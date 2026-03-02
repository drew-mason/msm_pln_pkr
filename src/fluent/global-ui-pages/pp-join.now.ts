import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import joinPage from '../../client/join.html'

export const pp_join = UiPage({
    $id: Now.ID['pp_join'],
    endpoint: 'pp_join.do',
    description: 'Planning Poker Session Join Portal',
    category: 'general',
    html: joinPage,
    direct: true
})