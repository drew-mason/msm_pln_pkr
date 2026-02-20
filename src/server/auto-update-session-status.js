import { gs, GlideAggregate, GlideRecord } from '@servicenow/glide'

// Auto Update Session Status - Updates session status when stories are completed
export function autoUpdateSessionStatus(current, previous) {
    try {
        var sessionId = current.getValue('session');
        if (!sessionId) {
            gs.info('[autoUpdateSessionStatus] No session ID found for story: ' + String(current.getUniqueValue()));
            return;
        }

        // Check if story status changed to a final state or story_points was set
        var currentStatus = current.getValue('status');
        var previousStatus = previous ? previous.getValue('status') : '';
        var currentPoints = current.getValue('story_points');
        var previousPoints = previous ? previous.getValue('story_points') : '';

        var storyFinalized = (currentStatus === 'completed' || currentStatus === 'revealed' || currentStatus === 'skipped');
        var pointsAdded = (currentPoints && currentPoints !== previousPoints);

        if (!storyFinalized && !pointsAdded) {
            return; // Nothing to process
        }

        // Use GlideAggregate to count stories by status for the session
        var agg = new GlideAggregate('x_902080_planningw_session_stories');
        agg.addQuery('session', sessionId);
        agg.addAggregate('COUNT', 'status');
        agg.groupBy('status');
        agg.query();

        var statusCounts = {};
        while (agg.next()) {
            var status = agg.getValue('status');
            var count = parseInt(agg.getAggregate('COUNT', 'status'));
            statusCounts[status] = count;
        }

        // Check if all stories are in final states (no pending or voting stories)
        var pendingCount = statusCounts['pending'] || 0;
        var votingCount = statusCounts['voting'] || 0;
        var totalStories = 0;
        
        for (var status in statusCounts) {
            totalStories += statusCounts[status];
        }

        // If all stories are done and at least one story was worked on
        if ((pendingCount === 0 && votingCount === 0) && totalStories > 0) {
            // Get fresh session record to prevent race conditions
            var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
            if (sessionGr.get(sessionId)) {
                var currentSessionStatus = sessionGr.getValue('status');
                
                // Skip if session is already completed or cancelled (idempotent check)
                if (currentSessionStatus === 'completed' || currentSessionStatus === 'cancelled') {
                    gs.info('[autoUpdateSessionStatus] Session already in final state: ' + currentSessionStatus);
                    return;
                }

                sessionGr.setValue('status', 'completed');
                sessionGr.setValue('active', false);
                sessionGr.update();
                
                gs.info('[autoUpdateSessionStatus] Session completed: ' + sessionId + ' (Total stories: ' + totalStories + ')');
            }
        }

    } catch (e) {
        gs.error('[autoUpdateSessionStatus] Error updating session status: ' + String(e.message));
    }
}