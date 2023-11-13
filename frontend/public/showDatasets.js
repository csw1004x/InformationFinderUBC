// add listener for when show datasets is clicked
document.getElementById("show-datasets-button").addEventListener('click', () => {
	fetch('/dataset') // Replace with the actual API endpoint
	  .then(response => response.json())
	  .then(data => {
		renderTable(data.result);
	  })
	  .catch(error => console.error('Error fetching data:', error));
});

// call /datasets
function renderTable(datasetArray) {
	clearMainSection();

    const tableContainer = document.getElementById('tableContainer');

	// header text
	const headerText = document.createElement('h2');
  	headerText.textContent = 'Show Datasets';

	const table = document.createElement('table');
	// table header
	const tableHead = table.createTHead();
	const headerRow = tableHead.insertRow();
	headerRow.innerHTML = '<th>Dataset ID</th><th>Kind</th><th>Number of Rows</th>';

	// table body
	const tableBody = document.createElement('tbody');
	table.appendChild(tableBody);

	// Insert new rows
	datasetArray.forEach(dataset => {
		const row = tableBody.insertRow();
		const cell1 = row.insertCell(0);
		const cell2 = row.insertCell(1);
		const cell3 = row.insertCell(2);

		// Populate cells with dataset information
		cell1.textContent = dataset.id;
		cell2.textContent = dataset.kind;
		cell3.textContent = dataset.numRows;
		// Add more lines to populate other cells
	});

	
	// tableCtonainer.remove();
	tableContainer.appendChild(headerText);
	tableContainer.appendChild(table);
}