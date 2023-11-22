// add listener for when upload datasets is clicked
document.getElementById("add-section-button").addEventListener('click', () => {
	updateSectionForm();
});

// call /datasets
function updateSectionForm() {
	clearMainSection();

	const contentContainer = document.getElementById('contentContainer');

	// header text
	const headerText = document.createElement('h2');
	headerText.textContent = 'Add Sections';

	// Create form element
	const form = document.createElement('form');
	form.id = 'uploadForm';
	form.enctype="multipart/form-data"

	const dataIdLabel = document.createElement('label');
	dataIdLabel.textContent = 'ID: ';
	const inputID = document.createElement('input');
	inputID.type = 'text';
	inputID.id = 'idInput';
	inputID.name = 'idInput';
	inputID.required = true;

	const uuidLabel = document.createElement('label');
	uuidLabel.textContent = 'UUID: ';
	const inputuuid = document.createElement('input');
	inputuuid.type = 'text';
	inputuuid.id = 'uuidInput';
	inputuuid.name = 'uuidInput';
	inputuuid.required = true;

	const courseIdLabel = document.createElement('label');
	courseIdLabel.textContent = 'UUID: ';
	const inputCourse = document.createElement('input');
	inputCourse.type = 'text';
	inputCourse.id = 'courseInput';
	inputCourse.name = 'courseInput';
	inputCourse.required = true;

	const titleLabel = document.createElement('label');
	titleLabel.textContent = 'UUID: ';
	const inputTitle = document.createElement('input');
	inputTitle.type = 'text';
	inputTitle.id = 'titleInput';
	inputTitle.name = 'titleInput';
	inputTitle.required = true;
	
	const instructorLabel = document.createElement('label');
	instructorLabel.textContent = 'UUID: ';
	const inputInstructor = document.createElement('input');
	inputInstructor.type = 'text';
	inputInstructor.id = 'instrutorInput';
	inputInstructor.name = 'instrutorInput';
	inputInstructor.required = true;
	
	const deptLabel = document.createElement('label');
	deptLabel.textContent = 'UUID: ';
	const inputDept = document.createElement('input');
	inputDept.type = 'text';
	inputDept.id = 'instrutorInput';
	inputDept.name = 'instrutorInput';
	inputDept.required = true;

	// Create File Input
	const fileLabel = document.createElement('label');
	fileLabel.textContent = 'File: ';
	const inputFile = document.createElement('input');
	inputFile.type = 'file';
	inputFile.id = 'fileInput';
	inputFile.name = 'fileInput';
	inputFile.accept = '.zip';
	inputFile.required = true;

	// Create submit button
	const submitButton = document.createElement('button');
	submitButton.type = 'button'; // Change to 'submit' if you want to submit the form
	submitButton.textContent = 'Submit';
	submitButton.addEventListener('click', submitForm);

	const lineBreak = document.createElement('br');

	// Append elements to the form
	form.appendChild(dataIdLabel);
	form.appendChild(inputID);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(deptLabel);
	form.appendChild(inputDept);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(fileLabel);
	form.appendChild(inputFile);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(submitButton);

	// Append form to the body
	contentContainer.appendChild(headerText);
	contentContainer.appendChild(form);
}

function submitUserStoryTwoForm() {
	const deptID = document.getElementById('department_id').value;
	const url = `/query`;


	fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: queryInput
	})
		.then(response => response.json())
		.then((data) => {
			// console.log(data.result.length);
			if (data.result.length < 1) {
				updateSectionForm();
				alert("Invalid query. Try again.");
			} else {
				renderTable("Course Averages in Department", data.result)
			}
		})
		.catch((error) => {
			console.log("ERROR: ", error);
			alert("invalid query. try again.");
		})
}
