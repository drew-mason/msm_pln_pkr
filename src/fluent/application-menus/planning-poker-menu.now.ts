import '@servicenow/sdk/global'
import { ApplicationMenu } from '@servicenow/sdk/core'

ApplicationMenu({
    $id: Now.ID['app_menu_planning_poker'],
    title: 'Planning Poker',
    hint: 'Agile story estimation and planning poker sessions',
    order: 100,
    active: true,
    roles: ['x_902080_planningw.admin', 'x_902080_planningw.dealer', 'x_902080_planningw.facilitator', 'x_902080_planningw.voter']
})