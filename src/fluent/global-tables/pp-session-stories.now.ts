import '@servicenow/sdk/global'
import { Table, StringColumn, ReferenceColumn, BooleanColumn, IntegerColumn, ChoiceColumn, HTMLColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const pp_session_stories = Table({
    name: 'pp_session_stories',
    label: 'Planning Poker Session Stories',
    schema: {
        session: ReferenceColumn({
            table: 'pp_planning_session',
            label: 'Session'
        }),
        story: ReferenceColumn({
            table: 'rm_story',
            label: 'Story'
        }),
        story_number: StringColumn({ 
            label: 'Story Number',
            maxLength: 40 
        }),
        story_title: StringColumn({ 
            label: 'Story Title',
            maxLength: 200 
        }),
        story_description: HTMLColumn({ 
            label: 'Story Description',
            maxLength: 4000 
        }),
        acceptance_criteria: HTMLColumn({ 
            label: 'Acceptance Criteria',
            maxLength: 4000 
        }),
        status: ChoiceColumn({
            label: 'Status',
            choices: {
                pending: { label: 'Pending', sequence: 0 },
                voting: { label: 'Voting', sequence: 1 },
                revealed: { label: 'Revealed', sequence: 2 },
                completed: { label: 'Completed', sequence: 3 },
                skipped: { label: 'Skipped', sequence: 4 }
            },
            defaultValue: 'pending'
        }),
        order: IntegerColumn({ 
            label: 'Display Order' 
        }),
        story_points: StringColumn({ 
            label: 'Story Points',
            maxLength: 10 
        }),
        vote_count: IntegerColumn({ 
            label: 'Vote Count',
            defaultValue: 0 
        }),
        times_revoted: IntegerColumn({ 
            label: 'Times Revoted',
            defaultValue: 0 
        }),
        session_count: IntegerColumn({ 
            label: 'Session Count',
            defaultValue: 1 
        }),
        voting_started: DateTimeColumn({ 
            label: 'Voting Started' 
        }),
        voting_completed: DateTimeColumn({ 
            label: 'Voting Completed' 
        }),
        is_current_story: BooleanColumn({ 
            label: 'Current Story',
            defaultValue: false 
        }),
        dealer_comments: StringColumn({ 
            label: 'Dealer Comments',
            maxLength: 1000 
        }),
        presenter: ReferenceColumn({
            table: 'sys_user',
            label: 'Presenter'
        })
    }
})