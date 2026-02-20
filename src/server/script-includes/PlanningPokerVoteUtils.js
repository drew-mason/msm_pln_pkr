var PlanningPokerVoteUtils = Class.create();
PlanningPokerVoteUtils.prototype = {
    
    getNumericPoints: function(displayValue) {
        if (!displayValue) return null;
        
        var val = String(displayValue).toUpperCase();
        
        // Handle special values
        if (val === '?' || val === 'PASS' || val === 'BREAK') {
            return null;
        }
        
        // Handle numeric values
        if (!isNaN(val) && val !== '') {
            return parseFloat(val);
        }
        
        // Handle T-shirt sizes
        var tshirtMap = {
            'XS': 1,
            'S': 3,
            'M': 5,
            'L': 8,
            'XL': 13,
            'XXL': 21,
            'XXXL': 34
        };
        
        if (tshirtMap[val] !== undefined) {
            return tshirtMap[val];
        }
        
        return null;
    },
    
    formatDisplayWithNumeric: function(displayValue, numericValue) {
        if (!displayValue) return '';
        
        if (numericValue !== null && numericValue !== undefined && isNaN(displayValue)) {
            // For non-numeric display values, show both
            return displayValue + ' [' + numericValue + ']';
        }
        
        return String(displayValue);
    },
    
    calculateVoteSummary: function(votes) {
        if (!votes || votes.length === 0) {
            return {
                min: { display: null, numeric: null },
                max: { display: null, numeric: null },
                avg: null,
                median: { display: null, numeric: null },
                mode: { display: null, numeric: null },
                count: 0,
                validVotes: 0
            };
        }
        
        // Separate numeric and non-numeric votes
        var numericVotes = [];
        var allVotes = [];
        var displayCounts = {};
        
        for (var i = 0; i < votes.length; i++) {
            var vote = votes[i];
            var display = String(vote.vote_value);
            var numeric = vote.vote_numeric_value;
            
            allVotes.push({
                display: display,
                numeric: numeric
            });
            
            // Count display values for mode calculation
            displayCounts[display] = (displayCounts[display] || 0) + 1;
            
            // Collect numeric values for statistical calculations
            if (numeric !== null && numeric !== undefined && !isNaN(numeric)) {
                numericVotes.push(numeric);
            }
        }
        
        var result = {
            count: votes.length,
            validVotes: numericVotes.length
        };
        
        // Calculate statistics only if we have numeric votes
        if (numericVotes.length > 0) {
            numericVotes.sort(function(a, b) { return a - b; });
            
            // Min/Max
            result.min = {
                display: String(numericVotes[0]),
                numeric: numericVotes[0]
            };
            result.max = {
                display: String(numericVotes[numericVotes.length - 1]),
                numeric: numericVotes[numericVotes.length - 1]
            };
            
            // Average
            var sum = 0;
            for (var j = 0; j < numericVotes.length; j++) {
                sum += numericVotes[j];
            }
            result.avg = Math.round((sum / numericVotes.length) * 100) / 100;
            
            // Median
            var mid = Math.floor(numericVotes.length / 2);
            var medianValue;
            if (numericVotes.length % 2 === 0) {
                medianValue = (numericVotes[mid - 1] + numericVotes[mid]) / 2;
            } else {
                medianValue = numericVotes[mid];
            }
            result.median = {
                display: String(medianValue),
                numeric: medianValue
            };
        } else {
            result.min = { display: null, numeric: null };
            result.max = { display: null, numeric: null };
            result.avg = null;
            result.median = { display: null, numeric: null };
        }
        
        // Mode (most frequent display value)
        var maxCount = 0;
        var modeDisplay = null;
        for (var display in displayCounts) {
            if (displayCounts[display] > maxCount) {
                maxCount = displayCounts[display];
                modeDisplay = display;
            }
        }
        
        result.mode = {
            display: modeDisplay,
            numeric: modeDisplay ? this.getNumericPoints(modeDisplay) : null
        };
        
        return result;
    },

    type: 'PlanningPokerVoteUtils'
};