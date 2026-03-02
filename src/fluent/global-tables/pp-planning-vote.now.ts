import '@servicenow/sdk/global'
import { Table, StringColumn, ReferenceColumn, BooleanColumn, DecimalColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const pp_planning_vote = Table({
    name: 'pp_planning_vote',
    label: 'Planning Poker Vote',
    schema: {
        session: ReferenceColumn({
            table: 'pp_planning_session',
            label: 'Session'
        }),
        story: ReferenceColumn({
            table: 'pp_session_stories',
            label: 'Story'
        }),
        voter: ReferenceColumn({
            table: 'sys_user',
            label: 'Voter'
        }),
        vote_value: StringColumn({ 
            label: 'Vote Value',
            maxLength: 20 
        }),
        vote_numeric_value: DecimalColumn({ 
            label: 'Numeric Value',
            scale: 2 
        }),
        vote_time: DateTimeColumn({ 
            label: 'Vote Time' 
        }),
        is_final_vote: BooleanColumn({ 
            label: 'Final Vote',
            defaultValue: false 
        })
    }
})