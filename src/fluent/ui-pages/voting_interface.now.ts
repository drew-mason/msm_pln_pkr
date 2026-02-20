import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['ui_page_voting_interface'],
    endpoint: 'x_902080_planningw_voting_interface.do',
    html: Now.include('../../html/ui-pages/voting_interface.html.html'),
    clientScript: '',
    processingScript: '',
    category: 'general'
})