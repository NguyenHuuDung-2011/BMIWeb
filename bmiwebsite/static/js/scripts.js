let history = [];

function standardizedName(name){
    return name
    .trim() // Loại bỏ khoảng trắng đầu và cuối
    .toLowerCase() // Đưa toàn bộ về chữ thường
    .split(/\s+/) // Tách theo khoảng trắng (1 hoặc nhiều)
    .map(tu => tu.charAt(0).toUpperCase() + tu.slice(1)) // Viết hoa chữ cái đầu
    .join(' '); // Ghép lại thành chuỗi hoàn chỉnh
}

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
    
    const bmi = height > 0 ? (weight / (height * height)) : 0;
    let category = getCategory(height, weight);

    const prompt = `Tôi tên là ${name}, ${gender}, ${age} tuổi, cao ${height}m, nặng ${weight}kg, BMI = ${bmi.toFixed(1)}. Tôi thuộc nhóm '${category}'. Hãy tư vấn chế độ ăn uống và vận động phù hợp cho tôi.`;

    document.getElementById("output").style.display = "block";
    document.getElementById("output").innerHTML = `
        <strong>Kết quả tuần ${week}:</strong><br>
        - Chỉ số BMI: ${bmi.toFixed(1)}<br>
        - Phân loại thể trạng: <strong>${category}</strong><br><br>
        <strong>Prompt gợi ý để hỏi ChatGPT:</strong><br>
        <em>${prompt}</em>
    `;

    history.push({
        week: week,
        name: name,
        height: height,
        weight: weight,
        bmi: bmi.toFixed(1),
        category: category
    });

    history.sort((a, b) => a.week - b.week);
    updateTable();
    //updateChart();

    // After calculating and validating data:
    sendStudentData({
        name, age, gender, week, height, weight
    });
}

function updateTable() {
    const tbody = document.getElementById("historyTable").querySelector("tbody");
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

/*function updateChart() {
    const canvas = document.getElementById('bmiChart');
    if (!canvas) return; // Canvas not found
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Context not found

    const labels = history.map(item => 'Tuần ' + item.week);
    const data = history.map(item => parseFloat(item.bmi));

    if (window.bmiChart && window.bmiChart.data) {
        window.bmiChart.data.labels = labels;
        window.bmiChart.data.datasets[0].data = data;
        window.bmiChart.update();
    } else {
        window.bmiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Chỉ số BMI theo tuần',
                    data: data,
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
*/

// Example function to send data to Django
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
        updateTable();
        updateChart();
    });
}

// Helper to get BMI category
function getCategory(height, weight) {
    const bmi = height > 0 ? weight / (height * height) : 0;
    if (bmi < 18.5) return "Gầy";
    else if (bmi < 23) return "Bình thường";
    else if (bmi < 25) return "Tiền béo phì";
    else if (bmi < 30) return "Béo phì I";
    else return "Béo phì II trở lên";
}