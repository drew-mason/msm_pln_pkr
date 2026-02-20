import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

// Session Management module
Record({
    $id: Now.ID['module_session_management'],
    table: 'sys_app_module',
    data: {
        title: 'Session Management',
        application: Now.ID['app_menu_planning_poker'],
        link_type: 'DIRECT',
        query: 'x_902080_planningw_session_management.do',
        active: true,
        order: 100,
        roles: ['x_902080_planningw.admin', 'x_902080_planningw.dealer', 'x_902080_planningw.facilitator']
    }
})

// Join Session module
Record({
    $id: Now.ID['module_join_session'],
    table: 'sys_app_module',
    data: {
        title: 'Join Session',
        application: Now.ID['app_menu_planning_poker'],
        link_type: 'DIRECT',
        query: 'x_902080_planningw_join.do',
        active: true,
        order: 200,
        roles: ['x_902080_planningw.admin', 'x_902080_planningw.dealer', 'x_902080_planningw.facilitator', 'x_902080_planningw.voter', 'x_902080_planningw.spectator']
    }
})

// Planning Sessions (table view)
Record({
    $id: Now.ID['module_planning_sessions'],
    table: 'sys_app_module',
    data: {
        title: 'Sessions',
        application: Now.ID['app_menu_planning_poker'],
        link_type: 'LIST',
        name: 'x_902080_planningw_planning_session',
        active: true,
        order: 300,
        roles: ['x_902080_planningw.admin', 'x_902080_planningw.dealer', 'x_902080_planningw.facilitator']
    }
})

// Scoring Methods (table view)
Record({
    $id: Now.ID['module_scoring_methods'],
    table: 'sys_app_module',
    data: {
        title: 'Scoring Methods',
        application: Now.ID['app_menu_planning_poker'],
        link_type: 'LIST',
        name: 'x_902080_planningw_scoring_method',
        active: true,
        order: 400,
        roles: ['x_902080_planningw.admin']
    }
})