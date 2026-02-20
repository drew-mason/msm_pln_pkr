import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['ui_page_session_management'],
    endpoint: 'x_902080_planningw_session_management.do',
    html: Now.include('../../html/ui-pages/session_management.html.html'),
    clientScript: '',
    processingScript: '',
    category: 'general'
})