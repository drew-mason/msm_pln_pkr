import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['ui_page_session_statistics'],
    endpoint: 'x_902080_planningw_session_statistics.do',
    html: Now.include('../../html/ui-pages/session_statistics.html.html'),
    clientScript: '',
    processingScript: '',
    category: 'general'
})