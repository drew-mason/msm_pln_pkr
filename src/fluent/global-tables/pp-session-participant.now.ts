import '@servicenow/sdk/global'
import { Table, ReferenceColumn, ChoiceColumn, DateTimeColumn, BooleanColumn } from '@servicenow/sdk/core'

export const pp_session_participant = Table({
    name: 'pp_session_participant',
    label: 'Planning Poker Session Participant',
    schema: {
        session: ReferenceColumn({
            table: 'pp_planning_session',
            label: 'Session'
        }),
        user: ReferenceColumn({
            table: 'sys_user',
            label: 'User'
        }),
        role: ChoiceColumn({
            label: 'Role',
            choices: {
                dealer: { label: 'Dealer', sequence: 0 },
                voter: { label: 'Voter', sequence: 1 },
                spectator: { label: 'Spectator', sequence: 2 }
            },
            defaultValue: 'voter'
        }),
        status: ChoiceColumn({
            label: 'Status',
            choices: {
                active: { label: 'Active', sequence: 0 },
                left: { label: 'Left', sequence: 1 },
                idle: { label: 'Idle', sequence: 2 }
            },
            defaultValue: 'active'
        }),
        joined_at: DateTimeColumn({ 
            label: 'Joined At' 
        }),
        last_seen: DateTimeColumn({ 
            label: 'Last Seen' 
        }),
        is_presenter: BooleanColumn({ 
            label: 'Is Presenter',
            defaultValue: false 
        }),
        is_observer: BooleanColumn({ 
            label: 'Is Observer',
            defaultValue: false 
        }),
        is_online: BooleanColumn({ 
            label: 'Is Online',
            defaultValue: true 
        })
    }
})