// add listener for when upload datasets is clicked
document.getElementById("remove-datasets-button").addEventListener('click', () => {
    renderDeleteForm();
});

// call /datasets
function renderDeleteForm() {
	clearMainSection();

    const contentContainer = document.getElementById('contentContainer');

    // header text
    const headerText = document.createElement('h2');
  	headerText.textContent = 'Remove Datasets';

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

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'button'; // Change to 'submit' if you want to submit the form
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', deleteDatasets);

    const lineBreak = document.createElement('br');

        // Append elements to the form
        form.appendChild(idLabel);
        form.appendChild(inputID);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));
        form.appendChild(submitButton);
    
        // Append form to the body
        contentContainer.appendChild(headerText);
        contentContainer.appendChild(form);
}

function deleteDatasets() {
    const idInput = document.getElementById('idInput').value;
    
    const url = `/dataset/${idInput}`;
    // console.log(url);

    fetch(url, {
        method: 'DELETE'
    }).then((response)=> {
        console.log(response);
    }).catch((error) => {
        console.log("ERROR: ", error);
    })

    // alert(`Test - Submitted to: ${url}`);
}