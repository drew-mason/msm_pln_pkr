import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import votingInterface from '../../client/voting-interface.html'

export const pp_voting_interface = UiPage({
    $id: Now.ID['pp_voting_interface'],
    endpoint: 'pp_voting_interface.do',
    description: 'Planning Poker Voting Interface - Real-time collaborative story estimation',
    category: 'general',
    html: votingInterface,
    direct: true
})