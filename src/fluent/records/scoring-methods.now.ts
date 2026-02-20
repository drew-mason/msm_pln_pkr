import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

// Default Scoring Methods for Planning Poker

// Fibonacci Sequence
export const fibonacci_method = Record({
    $id: Now.ID['fibonacci_method'],
    table: 'x_902080_planningw_scoring_method',
    data: {
        name: 'Fibonacci',
        values: '0,1,2,3,5,8,13,21,34,?,Pass',
        is_default: true,
        active: true,
        allow_custom_values: false
    }
})

// T-Shirt Sizing
export const tshirt_method = Record({
    $id: Now.ID['tshirt_method'],
    table: 'x_902080_planningw_scoring_method',
    data: {
        name: 'T-Shirt Sizing',
        values: 'XS,S,M,L,XL,XXL,?,Pass',
        is_default: false,
        active: true,
        allow_custom_values: false
    }
})

// Powers of 2
export const powers_method = Record({
    $id: Now.ID['powers_method'],
    table: 'x_902080_planningw_scoring_method',
    data: {
        name: 'Powers of 2',
        values: '0,1,2,4,8,16,32,64,?,Pass',
        is_default: false,
        active: true,
        allow_custom_values: false
    }
})

// Simple
export const simple_method = Record({
    $id: Now.ID['simple_method'],
    table: 'x_902080_planningw_scoring_method',
    data: {
        name: 'Simple',
        values: '1,2,3,4,5,?,Pass',
        is_default: false,
        active: true,
        allow_custom_values: false
    }
})