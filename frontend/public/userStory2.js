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
	courseIdLabel.textContent = 'Course ID: ';
	const inputCourse = document.createElement('input');
	inputCourse.type = 'text';
	inputCourse.id = 'courseInput';
	inputCourse.name = 'courseInput';
	inputCourse.required = true;

	const titleLabel = document.createElement('label');
	titleLabel.textContent = 'Title: ';
	const inputTitle = document.createElement('input');
	inputTitle.type = 'text';
	inputTitle.id = 'titleInput';
	inputTitle.name = 'titleInput';
	inputTitle.required = true;

	const instructorLabel = document.createElement('label');
	instructorLabel.textContent = 'Instructor: ';
	const inputInstructor = document.createElement('input');
	inputInstructor.type = 'text';
	inputInstructor.id = 'instructorInput';
	inputInstructor.name = 'instructorInput';
	inputInstructor.required = true;

	const deptLabel = document.createElement('label');
	deptLabel.textContent = 'Dept: ';
	const inputDept = document.createElement('input');
	inputDept.type = 'text';
	inputDept.id = 'deptInput';
	inputDept.name = 'deptInput';
	inputDept.required = true;

	const yearLabel = document.createElement('label');
	yearLabel.textContent = 'Year: ';
	const inputYear = document.createElement('input');
	inputYear.type = 'number';
	inputYear.id = 'yearInput';
	inputYear.name = 'yearInput';
	inputYear.required = true;

	const avgLabel = document.createElement('label');
	avgLabel.textContent = 'Average: ';
	const inputAvg = document.createElement('input');
	inputAvg.type = 'number';
	inputAvg.id = 'avgInput';
	inputAvg.name = 'avgInput';
	inputAvg.required = true;

	const passLabel = document.createElement('label');
	passLabel.textContent = 'Pass: ';
	const inputPass = document.createElement('input');
	inputPass.type = 'number';
	inputPass.id = 'passInput';
	inputPass.name = 'passInput';
	inputPass.required = true;

	const failLabel = document.createElement('label');
	failLabel.textContent = 'Fail: ';
	const inputFail = document.createElement('input');
	inputFail.type = 'number';
	inputFail.id = 'failInput';
	inputFail.name = 'failInput';
	inputFail.required = true;

	const auditLabel = document.createElement('label');
	auditLabel.textContent = 'Audit: ';
	const inputAudit = document.createElement('input');
	inputAudit.type = 'number';
	inputAudit.id = 'auditInput';
	inputAudit.name = 'auditInput';
	inputAudit.required = true;

	// Create submit button
	const submitButton = document.createElement('button');
	submitButton.type = 'button'; // Change to 'submit' if you want to submit the form
	submitButton.textContent = 'Add';
	submitButton.addEventListener('click', submitUserStoryTwoForm);

	const lineBreak = document.createElement('br');

	// Append elements to the form
	form.appendChild(dataIdLabel);
	form.appendChild(inputID);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(uuidLabel);
	form.appendChild(inputuuid);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(courseIdLabel);
	form.appendChild(inputCourse);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(titleLabel);
	form.appendChild(inputTitle);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(instructorLabel);
	form.appendChild(inputInstructor);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(deptLabel);
	form.appendChild(inputDept);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(yearLabel);
	form.appendChild(inputYear);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(avgLabel);
	form.appendChild(inputAvg);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(passLabel);
	form.appendChild(inputPass);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(failLabel);
	form.appendChild(inputFail);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(auditLabel);
	form.appendChild(inputAudit);
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	form.appendChild(submitButton);

	// Append form to the body
	contentContainer.appendChild(headerText);
	contentContainer.appendChild(form);
}

function submitUserStoryTwoForm() {
	const idInput = document.getElementById('idInput').value;
	const uuidInput = document.getElementById('uuidInput').value;
	const courseInput = document.getElementById('courseInput').value;
	const titleInput = document.getElementById('titleInput').value;
	const instructorInput = document.getElementById('instructorInput').value;
	const deptInput = document.getElementById('deptInput').value;
	const yearInput = document.getElementById('yearInput').value;
	const avgInput = document.getElementById('avgInput').value;
	const passInput = document.getElementById('passInput').value;
	const failInput = document.getElementById('failInput').value;
	const auditInput = document.getElementById('auditInput').value;

	const url = `/section/${idInput}/${uuidInput}/${courseInput}/${titleInput}/${instructorInput}/${deptInput}/${yearInput}/${avgInput}/${passInput}/${failInput}/${auditInput}`;
	///section/:dataid/:uuid/:id/:title/:instructor/:dept/:year/:avg/:pass/:fail/:audit

	fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		}
	}).then((response)=> {
		if(!response.ok) {
			alert("No such Dataset or Section uuid is already in dataset. Try again.");
		} else {
			alert(`Successfully added section.`);
		}
	}).catch((error) => {
		alert("No such Dataset or Section uuid is already in dataset. Try again.");
	})

}
