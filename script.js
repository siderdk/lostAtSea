/**
 * Lost at Sea - Scoring Calculator
 * Calculates differences between user/team rankings and expert rankings
 */

function calculateScores() {
    const personalInputs = document.querySelectorAll('.personal-input');
    const teamInputs = document.querySelectorAll('.team-input');
    const differences = document.querySelectorAll('.difference');
    
    let personalTotal = 0;
    let teamTotal = 0;
    let allPersonalFilled = true;
    let allTeamFilled = true;

    // Validate inputs before calculating: ensure numbers are between 1 and 15
    const allInputs = Array.from(personalInputs).concat(Array.from(teamInputs));
    for (const input of allInputs) {
        const val = input.value;
        if (val !== '') {
            const num = Number(val);
            if (!Number.isFinite(num) || num < 1 || num > 15) {
                alert('Please enter numbers between 1 and 15 for all fields.');
                input.focus();
                return;
            }
        }
    }

    // Check for duplicate values within each group (personal and team)
    const duplicateCheck = checkForDuplicates(personalInputs, teamInputs);
    if (duplicateCheck.found) {
        alert('Each rank must be unique within its group (personal/team). Please fix duplicates.');
        duplicateCheck.firstDuplicateInput.focus();
        return;
    }

    // Calculate scores for each item
    personalInputs.forEach((input, index) => {
        const expertRank = parseInt(input.dataset.expert);
        const personalRank = parseInt(input.value);
        const teamRank = parseInt(teamInputs[index].value);

        // Calculate personal difference
        if (personalRank && personalRank >= 1 && personalRank <= 15) {
            const diff = Math.abs(expertRank - personalRank);
            personalTotal += diff;
        } else {
            allPersonalFilled = false;
        }

        // Calculate team difference
        if (teamRank && teamRank >= 1 && teamRank <= 15) {
            const diff = Math.abs(expertRank - teamRank);
            teamTotal += diff;
            differences[index].textContent = diff;
        } else {
            allTeamFilled = false;
            differences[index].textContent = '-';
        }
    });

    // Display scores
    document.getElementById('personalScore').textContent = allPersonalFilled ? personalTotal : '-';
    document.getElementById('teamScore').textContent = allTeamFilled ? teamTotal : '-';

    // Show interpretation for team score
    if (allTeamFilled) {
        const message = getScoreInterpretation(teamTotal);
        alert('Team Score: ' + teamTotal + '\n\n' + message);
    }
}

/**
 * Get score interpretation based on US Coast Guard scoring system
 * @param {number} score - The total score
 * @returns {string} - Interpretation message
 */
function getScoreInterpretation(score) {
    if (score <= 25) {
        return '🎉 Excellent! You are rescued!';
    } else if (score <= 32) {
        return '👍 Good - Above average! You are rescued!';
    } else if (score <= 45) {
        return '😅 Average - With seasickness but rescued!';
    } else if (score <= 55) {
        return '😰 Fair - Barely alive but rescued!';
    } else if (score <= 70) {
        return '😵 Poor - Rescued just in time!';
    } else {
        return '💀 Very poor - Found weeks after searches stopped!';
    }
}

/**
 * Initialize keyboard navigation
 * Allows Enter key to move to next input field
 */
function initializeKeyboardNavigation() {
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach((input, index) => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextIndex = index + 1;
                if (nextIndex < inputs.length) {
                    inputs[nextIndex].focus();
                }
            }
        });
    });
}

/**
 * Initialize input validation for numeric fields
 * - sets min/max attributes
 * - shows inline style warnings and uses built-in validity messages
 */
function initializeValidation() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach((input) => {
        input.setAttribute('min', '1');
        input.setAttribute('max', '15');

        input.addEventListener('input', () => {
            const val = input.value;
            if (val === '') {
                input.setCustomValidity('');
                input.style.borderColor = '';
                // also re-check duplicates when clearing
                checkForDuplicates(document.querySelectorAll('.personal-input'), document.querySelectorAll('.team-input'));
                return;
            }
            const num = Number(val);
            if (!Number.isFinite(num) || num < 1 || num > 15) {
                input.setCustomValidity('Please enter a number between 1 and 15.');
                input.style.borderColor = 'red';
            } else {
                input.setCustomValidity('');
                input.style.borderColor = '';
                // re-check duplicates when a valid value is entered
                checkForDuplicates(document.querySelectorAll('.personal-input'), document.querySelectorAll('.team-input'));
            }
        });

        // On blur, show the validation message if invalid
        input.addEventListener('blur', () => {
            if (!input.checkValidity()) {
                input.reportValidity();
            }
        });
    });
}

/**
 * Check for duplicate numeric values within the personal and team groups.
 * Marks duplicate inputs with an orange border and sets a custom validity message.
 * Returns an object { found: boolean, firstDuplicateInput: Element|null }
 */
function checkForDuplicates(personalInputs, teamInputs) {
    const pList = Array.from(personalInputs);
    const tList = Array.from(teamInputs);

    // helper to build map value -> [inputs]
    function buildMap(list) {
        const map = Object.create(null);
        list.forEach((inp) => {
            const v = inp.value;
            if (v === '') return;
            if (!map[v]) map[v] = [];
            map[v].push(inp);
        });
        return map;
    }

    const pMap = buildMap(pList);
    const tMap = buildMap(tList);

    // Clear previous duplicate markers (but keep other invalid styling)
    [...pList, ...tList].forEach((inp) => {
        if (inp.dataset.duplicate === '1') {
            inp.dataset.duplicate = '';
            // only clear orange duplicate styling; do not override red (range) styling
            if (inp.style.borderColor === 'orange') inp.style.borderColor = '';
            // clear duplicate-specific validity
            if (inp.validationMessage === 'Each rank must be unique within its group (personal/team).') {
                inp.setCustomValidity('');
            }
        }
    });

    let found = false;
    let firstDuplicateInput = null;

    function mark(map) {
        Object.keys(map).forEach((val) => {
            const arr = map[val];
            if (arr.length > 1) {
                found = true;
                arr.forEach((inp) => {
                    inp.style.borderColor = 'orange';
                    inp.dataset.duplicate = '1';
                    inp.setCustomValidity('Each rank must be unique within its group (personal/team).');
                    if (!firstDuplicateInput) firstDuplicateInput = inp;
                });
            }
        });
    }

    mark(pMap);
    mark(tMap);

    return { found, firstDuplicateInput };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeKeyboardNavigation();
    initializeValidation();
});