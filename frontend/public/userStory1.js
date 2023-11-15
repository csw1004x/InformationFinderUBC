// add listener for when upload datasets is clicked
document.getElementById("average-sections-button").addEventListener('click', () => {
    renderAvgForm();
});

// call /datasets
function renderAvgForm() {
    clearMainSection();

    const contentContainer = document.getElementById('contentContainer');

    // header text
    const headerText = document.createElement('h2');
    headerText.textContent = 'User Story 1';

    // Create form element
    const form = document.createElement('form');
    form.id = 'queryForm';
    form.enctype = "multipart/form-data"

    // Create text Input
    const queryLabel = document.createElement('label');
    queryLabel.textContent = 'Query: ';
    const inputQUERY = document.createElement('input');
    inputQUERY.type = 'text';
    inputQUERY.id = 'queryInput';
    inputQUERY.name = 'queryInput';
    inputQUERY.required = true;

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'button'; // Change to 'submit' if you want to submit the form
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', submitQueryForm);

    const lineBreak = document.createElement('br');

    // Append elements to the form
    form.appendChild(queryLabel);
    form.appendChild(inputQUERY);
    form.appendChild(document.createElement("br"));
    form.appendChild(document.createElement("br"));
    form.appendChild(submitButton);

    // Append form to the body
    contentContainer.appendChild(headerText);
    contentContainer.appendChild(form);
}

function submitQueryForm() {
    const queryInput = document.getElementById('queryInput').value;
    var jsonQuery = JSON.parse(queryInput);

    console.log(jsonQuery)

    const url = `/query`;
    // console.log(url);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonQuery)})
        .then(response => response.json())
        .then(data => renderTable("Queried Result", data.result))
        .catch((error) => {console.log("ERROR: ", error);
    })

    alert(`Test - Query Submitted to: ${url}`);
}
