import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn } from '@servicenow/sdk/core'

export const pp_scoring_method = Table({
    name: 'pp_scoring_method',
    label: 'Planning Poker Scoring Method',
    schema: {
        name: StringColumn({ 
            label: 'Method Name',
            maxLength: 100 
        }),
        values: StringColumn({ 
            label: 'Values (comma-separated)',
            maxLength: 500 
        }),
        is_default: BooleanColumn({ 
            label: 'Default Method',
            defaultValue: false 
        }),
        active: BooleanColumn({ 
            label: 'Active',
            defaultValue: true 
        }),
        allow_custom_values: BooleanColumn({ 
            label: 'Allow Custom Values',
            defaultValue: false 
        })
    }
})