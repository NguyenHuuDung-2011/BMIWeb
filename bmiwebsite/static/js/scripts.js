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

// Send data to Django using jQuery AJAX
function sendStudentData(data) {
    return $.ajax({
        url: '/',
        type: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(updatedData) {
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
            // Show chart for selected student
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

// Generate result and send to backend
function generateResult() {
    const name = standardizedName(document.getElementById("name").value);
    const age = parseInt(document.getElementById("age").value);
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
    if (age <= 0 || week <= 0 || height <= 0 || weight <= 0) {
        alert("Vui lòng nhập thông tin hợp lệ.");
        return;
    }

    // Check for duplicate (same name and week)
    const isDuplicate = history.some(
        entry => entry.name === name && entry.week === week
    );
    if (isDuplicate) {
        alert(`Học sinh ${name} đã tồn tại trong danh sách!`);
        return;
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
            return;
        }
    } else {
        // Has previous records: only allow next consecutive week
        const lastWeek = sortedWeeks[sortedWeeks.length - 1];
        if (week !== lastWeek + 1) {
            alert(`Tuần tiếp theo cho học sinh ${name} phải là tuần ${lastWeek + 1}.`);
            return;
        }
    }

    // Calculate BMI and category
    const bmi = height > 0 ? (weight / (height * height)) : 0;
    const category = getCategory(height, weight);

    // Display result
    document.getElementById("output").style.display = "block";
    document.getElementById("output").innerHTML = `
        <strong>Kết quả tuần ${week}:</strong><br>
        - Chỉ số BMI: ${bmi.toFixed(1)}<br>
        - Phân loại thể trạng: <strong>${category}</strong><br><br>
        <strong>Prompt gợi ý để hỏi ChatGPT:</strong><br>
        <em>Tôi tên là ${name}, ${gender}, ${age} tuổi, cao ${height}m, nặng ${weight}kg, BMI = ${bmi.toFixed(1)}. Tôi thuộc nhóm '${category}'. Hãy tư vấn chế độ ăn uống và vận động phù hợp cho tôi.</em>
    `;

    // Add to history
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

    // Sort history by week
    history.sort((a, b) => a.week - b.week);

    // Update table and send data to backend
    updateTable();
    sendStudentData({ name, age, gender, week, height, weight })
        .then(() => {
            // Set dropdown to show current student
            const studentSelect = document.getElementById('studentSelect');
            if (studentSelect) {
                studentSelect.value = name;
                showChartForSelectedStudent();
            }
        });
}

// Populate student select dropdown
function populateStudentSelect() {
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

// Show chart for selected or first student
function showChartForSelectedStudent() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedName = studentSelect.value;
    // If nothing is selected (default option), then hide the canvas and do nothing
    if (!selectedName) {
        document.getElementById('bmiChart').style.display = 'none';
        return;
    }
    const filtered = history.filter(item => item.name === selectedName);
    updateChart(filtered);
    document.getElementById('bmiChart').style.display = 'block';
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
        });
    }
});