import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

// Planning Poker Application Roles

// Admin - Full access to manage all sessions, scoring methods, and app configuration
export const x_902080_planningw_admin = Role({
    name: 'x_902080_planningw.admin',
    description: 'Full access — manage all sessions, scoring methods, and app configuration',
    elevated_privilege: false,
    grantable: true,
    can_delegate: true
})

// Dealer - Can create and facilitate estimation sessions
export const x_902080_planningw_dealer = Role({
    name: 'x_902080_planningw.dealer',
    description: 'Can create and facilitate estimation sessions',
    elevated_privilege: false,
    grantable: true,
    can_delegate: true
})

// Facilitator - Same as dealer — can manage any session (co-facilitator)
export const x_902080_planningw_facilitator = Role({
    name: 'x_902080_planningw.facilitator',
    description: 'Same as dealer — can manage any session (co-facilitator)',
    elevated_privilege: false,
    grantable: true,
    can_delegate: true,
    contains_roles: [x_902080_planningw_dealer]
})

// Voter - Can participate in sessions and cast votes
export const x_902080_planningw_voter = Role({
    name: 'x_902080_planningw.voter',
    description: 'Can participate in sessions and cast votes',
    elevated_privilege: false,
    grantable: true,
    can_delegate: true
})

// Spectator - Can view sessions but cannot vote
export const x_902080_planningw_spectator = Role({
    name: 'x_902080_planningw.spectator',
    description: 'Can view sessions but cannot vote',
    elevated_privilege: false,
    grantable: true,
    can_delegate: true
})