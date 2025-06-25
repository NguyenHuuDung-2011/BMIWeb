import { history } from './history.js';

export function updateTable() {
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