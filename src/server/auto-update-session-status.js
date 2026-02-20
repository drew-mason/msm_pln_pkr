import { gs, GlideAggregate, GlideRecord } from '@servicenow/glide'

// Auto Update Session Status - Updates session counters and status when stories change
export function autoUpdateSessionStatus(current, previous) {
    try {
        var sessionId = current.getValue('session');
        if (!sessionId) {
            gs.debug('[autoUpdateSessionStatus] No session ID found for story: ' + String(current.getUniqueValue()));
            return;
        }

        // Check if story status changed to a final state or story_points was set
        var currentStatus = current.getValue('status');
        var previousStatus = previous ? previous.getValue('status') : '';
        var currentPoints = current.getValue('story_points');
        var previousPoints = previous ? previous.getValue('story_points') : '';

        var storyFinalized = (currentStatus === 'completed' || currentStatus === 'revealed' || currentStatus === 'skipped');
        var pointsAdded = (currentPoints && currentPoints !== previousPoints);
        var statusChanged = (currentStatus !== previousStatus);

        if (!storyFinalized && !pointsAdded && !statusChanged) {
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

        var pendingCount = statusCounts['pending'] || 0;
        var votingCount = statusCounts['voting'] || 0;
        var completedCount = (statusCounts['completed'] || 0) + (statusCounts['revealed'] || 0);
        var skippedCount = statusCounts['skipped'] || 0;
        var totalStories = 0;
        
        for (var s in statusCounts) {
            totalStories += statusCounts[s];
        }

        // Count total votes for this session
        var voteAgg = new GlideAggregate('x_902080_planningw_planning_vote');
        voteAgg.addQuery('session', sessionId);
        voteAgg.addAggregate('COUNT');
        voteAgg.query();
        var totalVotes = 0;
        if (voteAgg.next()) {
            totalVotes = parseInt(voteAgg.getAggregate('COUNT'));
        }

        // Update session counter fields
        var sessionGr = new GlideRecord('x_902080_planningw_planning_session');
        if (sessionGr.get(sessionId)) {
            var currentSessionStatus = sessionGr.getValue('status');
            
            // Always update counters
            sessionGr.setValue('total_stories', totalStories);
            sessionGr.setValue('stories_voted', completedCount + skippedCount);
            sessionGr.setValue('stories_completed', completedCount);
            sessionGr.setValue('stories_skipped', skippedCount);
            sessionGr.setValue('total_votes', totalVotes);

            // Auto-complete session if all stories are done
            if ((pendingCount === 0 && votingCount === 0) && totalStories > 0) {
                // Skip if session is already completed or cancelled (idempotent check)
                if (currentSessionStatus !== 'completed' && currentSessionStatus !== 'cancelled') {
                    sessionGr.setValue('status', 'completed');
                    sessionGr.setValue('active', false);
                    gs.info('[autoUpdateSessionStatus] Session completed: ' + sessionId + ' (Total stories: ' + totalStories + ')');
                }
            }

            sessionGr.update();
        }

    } catch (e) {
        gs.error('[autoUpdateSessionStatus] Error updating session status: ' + String(e.message));
    }
}