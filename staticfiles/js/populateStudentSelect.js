import { history } from './history.js';

export function populateStudentSelect() {
    const studentSelect = document.getElementById('studentSelect');
    if (!studentSelect) return;

    // Store current selection
    const currentSelection = studentSelect.value;

    // Remove all options except the first (default) option
    studentSelect.options.length = 1;

    // Populate the dropdown with unique student names
    const uniqueNames = [...new Set(history.map(item => item.name))];
    uniqueNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        studentSelect.appendChild(option);
    });

    // Restore selection or keep current value
    if (currentSelection) {
        studentSelect.value = currentSelection;
    }
}