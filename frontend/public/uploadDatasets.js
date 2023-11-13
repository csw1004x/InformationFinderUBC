// add listener for when upload datasets is clicked
document.getElementById("upload-datasets-button").addEventListener('click', () => {
    renderUploadForm();
});

// call /datasets
function renderUploadForm() {
	clearMainSection();

    const contentContainer = document.getElementById('contentContainer');

    // header text
    const headerText = document.createElement('h2');
  	headerText.textContent = 'Upload Datasets';

    // Create form element
    const form = document.createElement('form');
    form.id = 'uploadForm';
    form.enctype="multipart/form-data"

    // Create text Input
    const idLabel = document.createElement('label');
    idLabel.textContent = 'ID: ';
    const inputID = document.createElement('input');
    inputID.type = 'text';
    inputID.id = 'idInput';
    inputID.name = 'idInput';
    inputID.required = true;

    // Create kind Input
    const kindLabel = document.createElement('label');
    kindLabel.textContent = 'Kind: ';
    const inputKind = document.createElement('input');
    inputKind.type = 'text';
    inputKind.id = 'kindInput';
    inputKind.name = 'kindInput';
    inputKind.required = true;

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
    form.appendChild(idLabel);
    form.appendChild(inputID);
    form.appendChild(document.createElement("br"));
    form.appendChild(document.createElement("br"));
    form.appendChild(kindLabel);
    form.appendChild(inputKind);
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

function submitForm() {
    const idInput = document.getElementById('idInput').value;
    const kindInput = document.getElementById('kindInput').value;
    const fileInput = document.getElementById('fileInput').files[0];
    // console.log(fileInput)

    // const reader = new FileReader();
    const formData = new FormData();
    formData.append('fileInput', fileInput);
    // console.log(formData);

    const url = `/dataset/${idInput}/${kindInput}`;
    // console.log(url);

    fetch(url, {
        method: 'PUT',
        body: fileInput
    }).then((response)=> {
        console.log(response);
    }).catch((error) => {
        console.log("ERROR: ", error);
    })

    alert(`Test - Submitted to: ${url}`);
}