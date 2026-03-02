import '@servicenow/sdk/global'
import { Table, StringColumn, ReferenceColumn, BooleanColumn, IntegerColumn, ChoiceColumn } from '@servicenow/sdk/core'

export const pp_planning_session = Table({
    name: 'pp_planning_session',
    label: 'Planning Poker Session',
    extends: 'task',
    schema: {
        name: StringColumn({ 
            label: 'Session Name',
            maxLength: 100 
        }),
        description: StringColumn({ 
            label: 'Description',
            maxLength: 1000 
        }),
        status: ChoiceColumn({
            label: 'Status',
            choices: {
                ready: { label: 'Ready', sequence: 0 },
                live: { label: 'Live', sequence: 1 },
                completed: { label: 'Completed', sequence: 2 },
                cancelled: { label: 'Cancelled', sequence: 3 }
            },
            defaultValue: 'ready'
        }),
        session_code: StringColumn({ 
            label: 'Session Code',
            maxLength: 20 
        }),
        dealer: ReferenceColumn({
            table: 'sys_user',
            label: 'Dealer'
        }),
        facilitator: ReferenceColumn({
            table: 'sys_user',
            label: 'Facilitator'
        }),
        active_presenter: ReferenceColumn({
            table: 'sys_user',
            label: 'Active Presenter'
        }),
        scoring_method: ReferenceColumn({
            table: 'pp_scoring_method',
            label: 'Scoring Method'
        }),
        dealer_group: ReferenceColumn({
            table: 'sys_user_group',
            label: 'Dealer Group'
        }),
        allow_spectators: BooleanColumn({ 
            label: 'Allow Spectators',
            defaultValue: true 
        }),
        easy_mode: BooleanColumn({ 
            label: 'Easy Mode',
            defaultValue: false 
        }),
        demo_mode: BooleanColumn({ 
            label: 'Demo Mode',
            defaultValue: false 
        }),
        current_story: ReferenceColumn({
            table: 'pp_session_stories',
            label: 'Current Story'
        }),
        total_stories: IntegerColumn({ 
            label: 'Total Stories',
            defaultValue: 0 
        }),
        stories_voted: IntegerColumn({ 
            label: 'Stories Voted',
            defaultValue: 0 
        }),
        stories_completed: IntegerColumn({ 
            label: 'Stories Completed',
            defaultValue: 0 
        }),
        stories_skipped: IntegerColumn({ 
            label: 'Stories Skipped',
            defaultValue: 0 
        }),
        total_votes: IntegerColumn({ 
            label: 'Total Votes',
            defaultValue: 0 
        }),
        active: BooleanColumn({ 
            label: 'Active',
            defaultValue: true 
        })
    }
})