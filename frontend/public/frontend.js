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
