let history = [];

// Helper: Standardize name
function standardizedName(name){
    return name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(tu => tu.charAt(0).toUpperCase() + tu.slice(1))
        .join(' ');
}

// Helper: Get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Helper: BMI category
function getCategory(height, weight) {
    const bmi = height > 0 ? weight / (height * height) : 0;
    if (bmi < 18.5) return "Gầy";
    else if (bmi < 23) return "Bình thường";
    else if (bmi < 25) return "Tiền béo phì";
    else if (bmi < 30) return "Béo phì I";
    else return "Béo phì II trở lên";
}

// Table update
function updateTable() {
    const table = document.getElementById("historyTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    history.forEach(entry => {
        const row = `<tr>
            <td>${entry.week}</td>
            <td>${entry.name}</td>
            <td>${entry.height}</td>
            <td>${entry.weight}</td>
            <td>${entry.bmi}</td>
            <td>${entry.category}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Chart update
function updateChart(data) {
    data = data || history;
    const canvas = document.getElementById('bmiChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = data.map(item => 'Tuần ' + item.week);
    const bmiData = data.map(item => parseFloat(item.bmi));

    if (window.bmiChart && window.bmiChart.data) {
        window.bmiChart.data.labels = labels;
        window.bmiChart.data.datasets[0].data = bmiData;
        window.bmiChart.update();
    } else {
        window.bmiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Chỉ số BMI theo tuần',
                    data: bmiData,
                    borderColor: '#0077aa',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'BMI'
                        }
                    }
                }
            }
        });
    }
}

// Send data to Django
function sendStudentData(data) {
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(updatedData => {
        // Replace history with data from backend
        history = updatedData.student_health_list.map(student => ({
            week: student.week,
            name: student.name,
            height: student.height,
            weight: student.weight,
            bmi: (student.height > 0 ? (student.weight / (student.height * student.height)).toFixed(1) : '0'),
            category: getCategory(student.height, student.weight)
        }));
        populateStudentSelect();
        updateTable();
        // Show chart for selected or first student
        showChartForSelectedStudent();
    });
}

// Generate result and send to backend
function generateResult() {
    const name = standardizedName(document.getElementById("name").value);
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const week = parseInt(document.getElementById("week").value);
    const heightStr = document.getElementById("height").value;
    const weightStr = document.getElementById("weight").value;
    const height = parseFloat(heightStr);
    const weight = parseFloat(weightStr);

    if (!name || !age || heightStr === "" || weightStr === "" || !week) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
    }
    if (age < 0 || week <= 0 || height <= 0 || weight <= 0) {
        alert("Vui lòng nhập thông tin hợp lệ.");
        return;
    }

    // Check for duplicate (same name and week)
    const isDuplicate = history.some(
        entry => entry.name === name && String(entry.week) === String(week) && entry.gender === gender
    );
    if (isDuplicate) {
        document.getElementById("output").style.display = "block";
        document.getElementById("output").innerHTML = `<span style="color:red;">Học sinh ${name} đã tồn tại trong danh sách!</span>`;
        return;
    }

    const bmi = height > 0 ? (weight / (height * height)) : 0;
    let category = getCategory(height, weight);

    document.getElementById("output").style.display = "block";
    document.getElementById("output").innerHTML = `
        <strong>Kết quả tuần ${week}:</strong><br>
        - Chỉ số BMI: ${bmi.toFixed(1)}<br>
        - Phân loại thể trạng: <strong>${category}</strong><br><br>
        <strong>Prompt gợi ý để hỏi ChatGPT:</strong><br>
        <em>Tôi tên là ${name}, ${gender}, ${age} tuổi, cao ${height}m, nặng ${weight}kg, BMI = ${bmi.toFixed(1)}. Tôi thuộc nhóm '${category}'. Hãy tư vấn chế độ ăn uống và vận động phù hợp cho tôi.</em>
    `;

    history.push({
        week: week,
        name: name,
        age: age, // Make sure to include age for future checks!
        height: height,
        weight: weight,
        bmi: bmi.toFixed(1),
        category: category
    });

    history.sort((a, b) => a.week - b.week);
    updateTable();

    sendStudentData({
        name, age, gender, week, height, weight
    });
}

// Populate student select dropdown
function populateStudentSelect() {
    const studentSelect = document.getElementById('studentSelect');
    if (!studentSelect) return;
    // Remove all except the first option
    studentSelect.options.length = 1;
    const uniqueNames = [...new Set(history.map(item => item.name))];
    uniqueNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        studentSelect.appendChild(option);
    });
}

// Show chart for selected or first student
function showChartForSelectedStudent() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedName = studentSelect.value;
    let filtered = history;
    if (selectedName) {
        filtered = history.filter(item => item.name === selectedName);
    } else if (studentSelect.options.length > 1) {
        // If nothing selected, select the first student
        studentSelect.value = studentSelect.options[1].value;
        filtered = history.filter(item => item.name === studentSelect.value);
    }
    updateChart(filtered);
}

// On page load: get data from Django and initialize
document.addEventListener('DOMContentLoaded', function() {
    const djangoData = JSON.parse(document.getElementById('student-health-data').textContent);
    history = djangoData.map(student => ({
        week: student.week,
        name: student.name,
        age: student.age,
        height: student.height,
        weight: student.weight,
        bmi: (student.height > 0 ? (student.weight / (student.height * student.height)).toFixed(1) : '0'),
        category: getCategory(student.height, student.weight)
    }));

    populateStudentSelect();
    updateTable();
    showChartForSelectedStudent();

    // Event: change student
    const studentSelect = document.getElementById('studentSelect');
    if (studentSelect) {
        studentSelect.addEventListener('change', showChartForSelectedStudent);
    }
});