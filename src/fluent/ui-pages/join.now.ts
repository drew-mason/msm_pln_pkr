import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['ui_page_join'],
    endpoint: 'x_902080_planningw_join.do',
    html: Now.include('../../html/ui-pages/join.html.html'),
    clientScript: '',
    processingScript: '',
    category: 'general'
})