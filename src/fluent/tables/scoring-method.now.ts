import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn } from '@servicenow/sdk/core'

// Scoring Method - Configurable voting scales (Fibonacci, T-shirt sizes, etc.)
export const x_902080_planningw_scoring_method = Table({
    name: 'x_902080_planningw_scoring_method',
    label: 'Scoring Method',
    schema: {
        name: StringColumn({ 
            label: 'Method Name', 
            maxLength: 100,
            mandatory: true
        }),
        values: StringColumn({ 
            label: 'Values (comma-separated)', 
            maxLength: 500,
            mandatory: true
        }),
        is_default: BooleanColumn({ 
            label: 'Default Method',
            default: false
        }),
        active: BooleanColumn({ 
            label: 'Active',
            default: true
        }),
        allow_custom_values: BooleanColumn({ 
            label: 'Allow Custom Values',
            default: false
        })
    },
    accessible_from: 'public',
    actions: ['create', 'read', 'update', 'delete'],
    allow_web_service_access: true
})