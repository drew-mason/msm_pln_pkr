import { gs, GlideRecord } from '@servicenow/glide'

export function sessionStateManager(current, previous) {
    try {
        gs.debug('[SessionStateManager] Processing session state change for: ' + current.getValue('sys_id'));
        
        var sessionId = current.getValue('sys_id');
        var newStatus = current.getValue('status');
        var previousStatus = previous ? previous.getValue('status') : '';
        
        // Only process if status actually changed
        if (newStatus === previousStatus) {
            return;
        }
        
        gs.debug('[SessionStateManager] Status changed from "' + previousStatus + '" to "' + newStatus + '"');
        
        // When session status changes to completed: mark remaining stories as skipped
        if (newStatus === 'completed') {
            var storyGr = new GlideRecord('x_902080_planningw_session_stories');
            storyGr.addQuery('session', sessionId);
            storyGr.addQuery('status', 'IN', 'pending,voting');
            storyGr.query();
            
            var skippedCount = 0;
            while (storyGr.next()) {
                storyGr.setValue('status', 'skipped');
                storyGr.setValue('dealer_comments', 'Auto-skipped when session was completed');
                storyGr.update();
                skippedCount++;
            }
            
            if (skippedCount > 0) {
                gs.debug('[SessionStateManager] Auto-skipped ' + skippedCount + ' remaining stories');
            }
        }
        
        // When session status changes to cancelled: log cancellation
        if (newStatus === 'cancelled') {
            gs.debug('[SessionStateManager] Session cancelled: ' + current.getValue('name') + ' (ID: ' + sessionId + ')');
        }
        
    } catch (e) {
        gs.error('[SessionStateManager] Error processing session state change: ' + String(e));
    }
}