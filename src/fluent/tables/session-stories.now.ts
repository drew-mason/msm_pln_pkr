import '@servicenow/sdk/global'
import { Table, StringColumn, ChoiceColumn, ReferenceColumn, IntegerColumn, DateTimeColumn, BooleanColumn } from '@servicenow/sdk/core'

// Session Stories - Junction table linking stories to sessions
export const x_902080_planningw_session_stories = Table({
    name: 'x_902080_planningw_session_stories',
    label: 'Session Stories',
    schema: {
        session: ReferenceColumn({
            label: 'Session',
            referenceTable: 'x_902080_planningw_planning_session',
            mandatory: true,
            cascadeRule: 'cascade'
        }),
        story: ReferenceColumn({
            label: 'Story',
            referenceTable: 'rm_story'
        }),
        story_number: StringColumn({ 
            label: 'Story Number (Fallback)', 
            maxLength: 40
        }),
        story_title: StringColumn({ 
            label: 'Story Title (Fallback)', 
            maxLength: 200
        }),
        story_description: StringColumn({ 
            label: 'Story Description (Fallback)', 
            maxLength: 4000
        }),
        acceptance_criteria: StringColumn({ 
            label: 'Acceptance Criteria (Fallback)', 
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
            default: 'pending',
            dropdown: 'dropdown_without_none'
        }),
        order: IntegerColumn({ 
            label: 'Display Order',
            default: 100
        }),
        story_points: StringColumn({ 
            label: 'Final Story Points', 
            maxLength: 10
        }),
        vote_count: IntegerColumn({ 
            label: 'Vote Count',
            default: 0,
            read_only: true
        }),
        times_revoted: IntegerColumn({ 
            label: 'Times Revoted',
            default: 0
        }),
        session_count: IntegerColumn({ 
            label: 'Session Count',
            default: 1
        }),
        voting_started: DateTimeColumn({ 
            label: 'Voting Started'
        }),
        voting_completed: DateTimeColumn({ 
            label: 'Voting Completed'
        }),
        is_current_story: BooleanColumn({ 
            label: 'Current Story',
            default: false
        }),
        dealer_comments: StringColumn({ 
            label: 'Dealer Comments', 
            maxLength: 1000
        }),
        presenter: ReferenceColumn({
            label: 'Presenter',
            referenceTable: 'sys_user'
        })
    },
    accessible_from: 'public',
    actions: ['create', 'read', 'update', 'delete'],
    allow_web_service_access: true
})