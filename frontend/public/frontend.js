function handleClickMe() {
	alert("Button Clicked!");
}


function resetData() {
	// alert("Button Clicked!");
}

function loadData() {
	// alert("Button Clicked!");
}

function clearMainSection() {
	// clear defaultContainer
	const defaultContainer = document.getElementById('defaultContainer');
	defaultContainer.innerHTML = '';

	// clear contentContainer
	const contentContainer = document.getElementById('contentContainer');
	contentContainer.innerHTML = '';

	// clear tableContainer
	const tableContainer = document.getElementById('tableContainer');
	tableContainer.innerHTML = '';
}


function renderTable(header, datasetArray) {
	clearMainSection();

	const tableContainer = document.getElementById('tableContainer');

	// header text
	const headerText = document.createElement('h2');
	headerText.textContent = header;

	// create table
	const table = jsonToHtmlTable(datasetArray);

	// append
	tableContainer.appendChild(headerText);
	tableContainer.appendChild(table);
}


function jsonToHtmlTable(data) {
	const table = document.createElement('table');
	table.classList.add('table');
	const header = table.createTHead();
	const body = table.createTBody();

	// Create table header row
	const headerRow = header.insertRow();
	Object.keys(data[0]).forEach(key => {
		const th = document.createElement('th');
		th.textContent = key;
		headerRow.appendChild(th);
	});

	// Populate table body
	data.forEach(item => {
		const row = body.insertRow();
		Object.values(item).forEach(value => {
			const cell = row.insertCell();
			cell.textContent = value;
		});
	});

	return table;
}
