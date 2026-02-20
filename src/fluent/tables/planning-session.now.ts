import '@servicenow/sdk/global'
import { Table, StringColumn, ChoiceColumn, ReferenceColumn, BooleanColumn, IntegerColumn } from '@servicenow/sdk/core'

// Planning Session - Main estimation sessions table extending task
export const x_902080_planningw_planning_session = Table({
    name: 'x_902080_planningw_planning_session',
    label: 'Planning Session',
    extends: 'task',
    schema: {
        name: StringColumn({ 
            label: 'Session Name', 
            maxLength: 100,
            mandatory: true
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
            default: 'ready',
            dropdown: 'dropdown_without_none'
        }),
        session_code: StringColumn({ 
            label: 'Session Code', 
            maxLength: 20,
            mandatory: true
        }),
        dealer: ReferenceColumn({
            label: 'Dealer',
            referenceTable: 'sys_user',
            mandatory: true
        }),
        facilitator: ReferenceColumn({
            label: 'Facilitator',
            referenceTable: 'sys_user'
        }),
        active_presenter: ReferenceColumn({
            label: 'Active Presenter',
            referenceTable: 'sys_user'
        }),
        scoring_method: ReferenceColumn({
            label: 'Scoring Method',
            referenceTable: 'x_902080_planningw_scoring_method',
            mandatory: true
        }),
        dealer_group: ReferenceColumn({
            label: 'Dealer Group',
            referenceTable: 'sys_user_group'
        }),
        allow_spectators: BooleanColumn({ 
            label: 'Allow Spectators',
            default: true
        }),
        easy_mode: BooleanColumn({ 
            label: 'Easy Mode',
            default: false
        }),
        demo_mode: BooleanColumn({ 
            label: 'Demo Mode',
            default: false
        }),
        current_story: ReferenceColumn({
            label: 'Current Story',
            referenceTable: 'x_902080_planningw_session_stories'
        }),
        total_stories: IntegerColumn({ 
            label: 'Total Stories',
            default: 0,
            read_only: true
        }),
        stories_voted: IntegerColumn({ 
            label: 'Stories Voted',
            default: 0,
            read_only: true
        }),
        stories_completed: IntegerColumn({ 
            label: 'Stories Completed',
            default: 0,
            read_only: true
        }),
        stories_skipped: IntegerColumn({ 
            label: 'Stories Skipped',
            default: 0,
            read_only: true
        }),
        total_votes: IntegerColumn({ 
            label: 'Total Votes',
            default: 0,
            read_only: true
        }),
        active: BooleanColumn({ 
            label: 'Active',
            default: true
        })
    },
    accessible_from: 'public',
    actions: ['create', 'read', 'update', 'delete'],
    allow_web_service_access: true
})