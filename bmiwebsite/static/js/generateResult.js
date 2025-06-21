import { history } from './history.js';
import { validateInput } from './validateInput.js';
import { getCategory } from './getCategory.js';
import { standardizedName } from './standardizedName.js';
import { updateTable } from './updateTable.js';
import { sendStudentData } from './sendStudentData.js';
import { showChartForSelectedStudent } from './showChartForSelectedStudent.js';

export function generateResult() {
    const name = standardizedName(document.getElementById("name").value);
    const age = parseInt(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;
    const week = parseInt(document.getElementById("week").value);
    const heightStr = document.getElementById("height").value;
    const weightStr = document.getElementById("weight").value;
    const height = parseFloat(heightStr);
    const weight = parseFloat(weightStr);
    if (!validateInput(name, age, heightStr, weightStr, height, weight, week)) return;
    const bmi = height > 0 ? (weight / (height * height)) : 0;
    const category = getCategory(height, weight);

    document.getElementById("output").style.display = "block";
    document.getElementById("output").innerHTML = `
        <strong>Kết quả tuần ${week}:</strong><br>
        - Chỉ số BMI: ${bmi.toFixed(1)}<br>
        - Phân loại thể trạng: <strong>${category}</strong>
    `;

    history.push({
        week: week,
        name: name,
        age: age,
        gender: gender,
        height: height,
        weight: weight,
        bmi: bmi.toFixed(1),
        category: category
    });

    history.sort((a, b) => a.week - b.week);

    updateTable();
    sendStudentData({ name, age, gender, week, height, weight })
        .then(() => {
            const studentSelect = document.getElementById('studentSelect');
            if (studentSelect) {
                studentSelect.value = name;
                showChartForSelectedStudent();
            }
        });
}