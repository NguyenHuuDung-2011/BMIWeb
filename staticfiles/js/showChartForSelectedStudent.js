import { history } from './history.js';
import { updateChart } from './updateChart.js';

export function showChartForSelectedStudent() {
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