import '@servicenow/sdk/global'
import { Table, ReferenceColumn, ChoiceColumn, DateTimeColumn, BooleanColumn } from '@servicenow/sdk/core'

// Session Participant - Track who is in each session and their role
export const x_902080_planningw_session_participant = Table({
    name: 'x_902080_planningw_session_participant',
    label: 'Session Participant',
    schema: {
        session: ReferenceColumn({
            label: 'Session',
            referenceTable: 'x_902080_planningw_planning_session',
            mandatory: true,
            cascadeRule: 'cascade'
        }),
        user: ReferenceColumn({
            label: 'User',
            referenceTable: 'sys_user',
            mandatory: true
        }),
        role: ChoiceColumn({
            label: 'Role',
            choices: {
                dealer: { label: 'Dealer', sequence: 0 },
                voter: { label: 'Voter', sequence: 1 },
                spectator: { label: 'Spectator', sequence: 2 }
            },
            default: 'voter',
            dropdown: 'dropdown_without_none'
        }),
        status: ChoiceColumn({
            label: 'Status',
            choices: {
                active: { label: 'Active', sequence: 0 },
                left: { label: 'Left', sequence: 1 },
                idle: { label: 'Idle', sequence: 2 }
            },
            default: 'active',
            dropdown: 'dropdown_without_none'
        }),
        joined_at: DateTimeColumn({ 
            label: 'Joined At',
            mandatory: true
        }),
        last_seen: DateTimeColumn({ 
            label: 'Last Seen'
        }),
        is_presenter: BooleanColumn({ 
            label: 'Is Presenter',
            default: false
        }),
        is_observer: BooleanColumn({ 
            label: 'Is Observer',
            default: false
        }),
        is_online: BooleanColumn({ 
            label: 'Is Online',
            default: true
        })
    },
    accessible_from: 'public',
    actions: ['create', 'read', 'update', 'delete'],
    allow_web_service_access: true
})