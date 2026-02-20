import '@servicenow/sdk/global'
import { Table, StringColumn, DecimalColumn, IntegerColumn, ReferenceColumn, BooleanColumn } from '@servicenow/sdk/core'

// Scoring Value - Individual values within a scoring method
export const x_902080_planningw_scoring_value = Table({
    name: 'x_902080_planningw_scoring_value',
    label: 'Scoring Value',
    schema: {
        scoring_method: ReferenceColumn({
            label: 'Scoring Method',
            referenceTable: 'x_902080_planningw_scoring_method',
            mandatory: true,
            cascadeRule: 'cascade'
        }),
        display_value: StringColumn({ 
            label: 'Display Value', 
            maxLength: 20,
            mandatory: true
        }),
        numeric_value: DecimalColumn({ 
            label: 'Numeric Equivalent'
        }),
        order: IntegerColumn({ 
            label: 'Sort Order',
            default: 100
        }),
        is_special: BooleanColumn({ 
            label: 'Special Value (?, Pass, Break)',
            default: false
        })
    },
    accessible_from: 'public',
    actions: ['create', 'read', 'update', 'delete'],
    allow_web_service_access: true
})