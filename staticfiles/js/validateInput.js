import { history } from './history.js';

export function validateInput(name, age, heightStr, weightStr, height, weight, week) {
    if (!name || !age || heightStr === "" || weightStr === "" || !week) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return false;
    }
    if (age <= 0 || week <= 0 || height <= 0 || weight <= 0) {
        alert("Vui lòng nhập thông tin hợp lệ.");
        return false;
    }

    // Check for duplicate (same name and week)
    const isDuplicate = history.some(
        entry => entry.name === name && entry.week === week
    );
    if (isDuplicate) {
        alert(`Học sinh ${name} đã tồn tại trong danh sách!`);
        return false;
    }

    // Check for invalid week sequence
    const studentHistory = history.filter(entry => entry.name === name);
    const sortedWeeks = studentHistory.map(entry => entry.week).sort((a, b) => a - b);

    // Debug log
    console.log('Week:', week, 'Type:', typeof week);
    console.log('Sorted weeks:', sortedWeeks);

    if (sortedWeeks.length === 0) {
        // No previous records: only allow week 1
        if (week !== 1) {
            alert("Học sinh mới phải bắt đầu từ tuần 1.");
            return false;
        }
    } else {
        // Has previous records: only allow next consecutive week
        const lastWeek = sortedWeeks[sortedWeeks.length - 1];
        if (week !== lastWeek + 1) {
            alert(`Tuần tiếp theo cho học sinh ${name} phải là tuần ${lastWeek + 1}.`);
            return false;
        }
    }
    return true;
}