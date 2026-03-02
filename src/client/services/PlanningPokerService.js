// Planning Poker Service Layer - handles all API communication
export class PlanningPokerService {
    constructor() {
        this.baseHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserToken': window.g_ck
        };
    }

    // Session operations
    async getSession(sessionId) {
        try {
            const ga = new GlideAjax('PlanningPokerAjax');
            ga.addParam('sysparm_name', 'getSession');
            ga.addParam('session_id', sessionId);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to parse session response: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to get session: ' + error.message);
        }
    }

    async getVotingStatus(sessionId) {
        try {
            const ga = new GlideAjax('PlanningPokerAjax');
            ga.addParam('sysparm_name', 'getVotingStatus');
            ga.addParam('session_id', sessionId);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to parse voting status: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to get voting status: ' + error.message);
        }
    }

    // Voting operations
    async castVote(sessionId, storyId, voteValue) {
        try {
            const ga = new GlideAjax('PlanningPokerAjax');
            ga.addParam('sysparm_name', 'castVote');
            ga.addParam('session_id', sessionId);
            ga.addParam('story_id', storyId);
            ga.addParam('vote_value', voteValue);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to cast vote: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to cast vote: ' + error.message);
        }
    }

    async revealVotes(sessionId, storyId) {
        try {
            const ga = new GlideAjax('PlanningPokerAjax');
            ga.addParam('sysparm_name', 'revealVotes');
            ga.addParam('session_id', sessionId);
            ga.addParam('story_id', storyId);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to reveal votes: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to reveal votes: ' + error.message);
        }
    }

    // Story operations
    async startVoting(sessionId, storyId) {
        try {
            const ga = new GlideAjax('PlanningPokerAjax');
            ga.addParam('sysparm_name', 'startVoting');
            ga.addParam('session_id', sessionId);
            ga.addParam('story_id', storyId);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to start voting: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to start voting: ' + error.message);
        }
    }

    async setStoryPoints(sessionId, storyId, points) {
        try {
            const ga = new GlideAjax('PlanningPokerAjax');
            ga.addParam('sysparm_name', 'setStoryPoints');
            ga.addParam('session_id', sessionId);
            ga.addParam('story_id', storyId);
            ga.addParam('story_points', points);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to set story points: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to set story points: ' + error.message);
        }
    }

    // Session management operations
    async createSession(sessionData) {
        try {
            const ga = new GlideAjax('SessionManagementAjax');
            ga.addParam('sysparm_name', 'createSession');
            ga.addParam('session_name', sessionData.name);
            ga.addParam('description', sessionData.description || '');
            ga.addParam('scoring_method', sessionData.scoringMethod);
            ga.addParam('allow_spectators', sessionData.allowSpectators);
            ga.addParam('easy_mode', sessionData.easyMode);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to create session: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to create session: ' + error.message);
        }
    }

    async getMySessions(status = 'all') {
        try {
            const ga = new GlideAjax('SessionManagementAjax');
            ga.addParam('sysparm_name', 'getMySessions');
            ga.addParam('status', status);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to get sessions: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to get sessions: ' + error.message);
        }
    }

    async getScoringMethods() {
        try {
            const ga = new GlideAjax('SessionManagementAjax');
            ga.addParam('sysparm_name', 'getScoringMethods');
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to get scoring methods: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to get scoring methods: ' + error.message);
        }
    }

    // Join session operations
    async getSessionByCode(sessionCode) {
        try {
            const ga = new GlideAjax('SessionParticipantAjax');
            ga.addParam('sysparm_name', 'getSessionByCode');
            ga.addParam('session_code', sessionCode);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to find session: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to find session: ' + error.message);
        }
    }

    async joinSession(sessionId, sessionCode) {
        try {
            const ga = new GlideAjax('SessionParticipantAjax');
            ga.addParam('sysparm_name', 'joinSession');
            ga.addParam('session_id', sessionId);
            ga.addParam('session_code', sessionCode);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to join session: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to join session: ' + error.message);
        }
    }

    // Statistics operations
    async getSessionStatistics(sessionId) {
        try {
            const ga = new GlideAjax('SessionStatisticsAjax');
            ga.addParam('sysparm_name', 'getSessionStatistics');
            ga.addParam('session_id', sessionId);
            
            return new Promise((resolve, reject) => {
                ga.getXML((response) => {
                    try {
                        const answer = response.responseXML.documentElement.getAttribute('answer');
                        const result = JSON.parse(answer);
                        resolve(result);
                    } catch (error) {
                        reject(new Error('Failed to get statistics: ' + error.message));
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to get session statistics: ' + error.message);
        }
    }

    // Table API operations for direct data access (global table names)
    async getTableRecords(tableName, filters = {}) {
        try {
            const searchParams = new URLSearchParams(filters);
            searchParams.set('sysparm_display_value', 'all');
            
            const response = await fetch(`/api/now/table/${tableName}?${searchParams.toString()}`, {
                method: 'GET',
                headers: this.baseHeaders
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            return result.result || [];
        } catch (error) {
            throw new Error(`Failed to get ${tableName} records: ${error.message}`);
        }
    }

    async createTableRecord(tableName, data) {
        try {
            const response = await fetch(`/api/now/table/${tableName}`, {
                method: 'POST',
                headers: this.baseHeaders,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to create ${tableName} record: ${error.message}`);
        }
    }

    async updateTableRecord(tableName, sysId, data) {
        try {
            const response = await fetch(`/api/now/table/${tableName}/${sysId}`, {
                method: 'PATCH',
                headers: this.baseHeaders,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to update ${tableName} record: ${error.message}`);
        }
    }

    // Helper functions for extracting ServiceNow field values
    extractDisplayValue(field) {
        return typeof field === 'object' ? field.display_value : field;
    }

    extractValue(field) {
        return typeof field === 'object' ? field.value : field;
    }

    extractSysId(record) {
        return this.extractValue(record.sys_id);
    }
}