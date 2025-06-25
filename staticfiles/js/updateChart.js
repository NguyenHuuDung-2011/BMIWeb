import { history } from './history.js';

export function updateChart(data) {
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