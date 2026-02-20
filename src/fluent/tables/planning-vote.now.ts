import '@servicenow/sdk/global'
import { Table, StringColumn, ReferenceColumn, DateTimeColumn, BooleanColumn, DecimalColumn } from '@servicenow/sdk/core'

// Planning Vote - Individual votes cast by participants
export const x_902080_planningw_planning_vote = Table({
    name: 'x_902080_planningw_planning_vote',
    label: 'Planning Vote',
    schema: {
        session: ReferenceColumn({
            label: 'Session',
            referenceTable: 'x_902080_planningw_planning_session',
            mandatory: true,
            cascadeRule: 'cascade'
        }),
        story: ReferenceColumn({
            label: 'Story',
            referenceTable: 'x_902080_planningw_session_stories',
            mandatory: true,
            cascadeRule: 'cascade'
        }),
        voter: ReferenceColumn({
            label: 'Voter',
            referenceTable: 'sys_user',
            mandatory: true
        }),
        vote_value: StringColumn({ 
            label: 'Vote Value', 
            maxLength: 20,
            mandatory: true
        }),
        vote_numeric_value: DecimalColumn({ 
            label: 'Numeric Vote Value'
        }),
        vote_time: DateTimeColumn({ 
            label: 'Vote Time',
            mandatory: true
        }),
        is_final_vote: BooleanColumn({ 
            label: 'Final Vote',
            default: false
        })
    },
    accessible_from: 'public',
    actions: ['create', 'read', 'update', 'delete'],
    allow_web_service_access: true
})