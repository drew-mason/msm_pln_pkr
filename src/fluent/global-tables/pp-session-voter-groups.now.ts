import '@servicenow/sdk/global'
import { Table, ReferenceColumn } from '@servicenow/sdk/core'

export const pp_session_voter_groups = Table({
    name: 'pp_session_voter_groups',
    label: 'Planning Poker Session Voter Groups',
    schema: {
        session: ReferenceColumn({
            table: 'pp_planning_session',
            label: 'Session'
        }),
        voter_group: ReferenceColumn({
            table: 'sys_user_group',
            label: 'Voter Group'
        })
    }
})