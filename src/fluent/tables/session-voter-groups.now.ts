import '@servicenow/sdk/global'
import { Table, ReferenceColumn } from '@servicenow/sdk/core'

// Session Voter Groups - Restrict which user groups can vote in a session
export const x_902080_planningw_session_voter_groups = Table({
    name: 'x_902080_planningw_session_voter_groups',
    label: 'Session Voter Groups',
    schema: {
        session: ReferenceColumn({
            label: 'Session',
            referenceTable: 'x_902080_planningw_planning_session',
            mandatory: true
        }),
        voter_group: ReferenceColumn({
            label: 'Voter Group',
            referenceTable: 'sys_user_group',
            mandatory: true
        })
    },
    accessible_from: 'public',
    actions: ['create', 'read', 'update', 'delete'],
    allow_web_service_access: true
})