import { setHistory, history } from './history.js';
import { getCookie } from './getCookie.js';
import { getCategory } from './getCategory.js';
import { populateStudentSelect } from './populateStudentSelect.js';
import { updateTable } from './updateTable.js';
import { showChartForSelectedStudent } from './showChartForSelectedStudent.js';

export function sendStudentData(data) {
    return $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(updatedData) {
            setHistory(updatedData.student_health_list.map(student => ({
                week: student.week,
                name: student.name,
                height: student.height,
                weight: student.weight,
                bmi: (student.height > 0 ? (student.weight / (student.height * student.height)).toFixed(1) : '0'),
                category: getCategory(student.height, student.weight)
            })));
            populateStudentSelect();
            updateTable();
            const studentSelect = document.getElementById('studentSelect');
            if (studentSelect) {
                studentSelect.value = data.name;
                showChartForSelectedStudent();
            }
        },
        error: function(xhr, status, error) {
            alert('Có lỗi xảy ra khi lưu dữ liệu!');
            console.error('Error:', error);
        }
    });
}