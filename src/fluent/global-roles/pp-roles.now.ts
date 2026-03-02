import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

export const pp_admin = Role({
    $id: Now.ID['pp_admin'],
    name: 'pp_admin',
    description: 'Planning Poker Administrator - Full access to all sessions and configuration',
    elevated_privilege: false
})

export const pp_dealer = Role({
    $id: Now.ID['pp_dealer'],
    name: 'pp_dealer',
    description: 'Planning Poker Dealer - Can create and facilitate estimation sessions',
    elevated_privilege: false
})

export const pp_facilitator = Role({
    $id: Now.ID['pp_facilitator'],
    name: 'pp_facilitator',
    description: 'Planning Poker Facilitator - Same as dealer, can manage any session',
    elevated_privilege: false
})

export const pp_voter = Role({
    $id: Now.ID['pp_voter'],
    name: 'pp_voter',
    description: 'Planning Poker Voter - Can participate in sessions and cast votes',
    elevated_privilege: false
})

export const pp_spectator = Role({
    $id: Now.ID['pp_spectator'],
    name: 'pp_spectator',
    description: 'Planning Poker Spectator - Can view sessions but cannot vote',
    elevated_privilege: false
})