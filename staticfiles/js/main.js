import { generateResult } from './generateResult.js';
import { getAdviceFromChatGPT } from './getAdviceFromChatGPT.js';
import { getCategory } from './getCategory.js';
import { populateStudentSelect } from './populateStudentSelect.js';
import { standardizedName } from './standardizedName.js';
import { updateChart } from './updateChart.js';
import { updateTable } from './updateTable.js';
import { history, setHistory } from './history.js';

document.addEventListener('DOMContentLoaded', function() {
    const djangoData = JSON.parse(document.getElementById('student-health-data').textContent);
    setHistory(djangoData.map(student => ({
        week: student.week,
        name: student.name,
        age: student.age,
        height: student.height,
        weight: student.weight,
        bmi: (student.height > 0 ? (student.weight / (student.height * student.height)).toFixed(1) : '0'),
        category: getCategory(student.height, student.weight)
    })));
    
    populateStudentSelect();
    updateTable();

    // Hide chart on load
    document.getElementById('bmiChart').style.display = 'none';
    
    // Event: manual selection shows chart
    const studentSelect = document.getElementById('studentSelect');
    const bmiChart = document.getElementById('bmiChart');
    studentSelect.addEventListener('change', function() {
        if (studentSelect.value) {
            bmiChart.style.display = 'block';
            updateChart(history.filter(item => item.name === studentSelect.value));
        } else {
            bmiChart.style.display = 'none';
        }
    });

    const submitButton = document.getElementById('submitButton');
    const bmiForm = document.getElementById('bmiForm');

    if (submitButton && bmiForm) {
        submitButton.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default form submission
            generateResult(); // Call the function to validate and process the form

            // ChatGPT advice
            const name = standardizedName(document.getElementById("name").value);
            const age = document.getElementById("age").value;
            const gender = document.getElementById("gender").value;
            const height = document.getElementById("height").value;
            const weight = document.getElementById("weight").value;
            const week = document.getElementById("week").value;

            if (!name || !age || !height || !weight || !week) {
                alert("Vui lòng nhập đầy đủ thông tin.");
                return;
            }

            const bmi = height > 0 ? (weight / (height * height)).toFixed(1) : '0';
            const category = getCategory(parseFloat(height), parseFloat(weight));
            const prompt = `Tôi tên là ${name}, ${gender}, ${age} tuổi, cao ${height}m, nặng ${weight}kg, BMI = ${bmi}. Tôi thuộc nhóm '${category}'. Hãy tư vấn chế độ ăn uống và vận động phù hợp cho tôi.`;

            const chatGPTOutput = document.getElementById("chatGPTOutput");
            chatGPTOutput.style.display = "block";
            chatGPTOutput.innerHTML = "Đang lấy tư vấn từ ChatGPT...";

            getAdviceFromChatGPT(prompt, function(answer) {
                if (answer.startsWith("Lỗi:")) {
                    chatGPTOutput.innerHTML = `<strong style="color:red;">${answer}</strong>`;
                } else {
                    chatGPTOutput.innerHTML = `<strong>Tư vấn từ ChatGPT:</strong><br>${marked.parse(answer)}`;
                }
            });
        });
    }
});