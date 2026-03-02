import '@servicenow/sdk/global'
import { Table, StringColumn, DecimalColumn, IntegerColumn, ReferenceColumn, BooleanColumn } from '@servicenow/sdk/core'

export const pp_scoring_value = Table({
    name: 'pp_scoring_value',
    label: 'Planning Poker Scoring Value',
    schema: {
        scoring_method: ReferenceColumn({
            referenceTo: 'pp_scoring_method',
            label: 'Scoring Method'
        }),
        display_value: StringColumn({ 
            label: 'Display Value',
            maxLength: 20 
        }),
        numeric_value: DecimalColumn({ 
            label: 'Numeric Value',
            scale: 2 
        }),
        order: IntegerColumn({ 
            label: 'Sort Order' 
        }),
        is_special: BooleanColumn({ 
            label: 'Special Value (?, Pass, Break)',
            defaultValue: false 
        })
    }
})