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
    headerText.textContent = 'Course Averages in Department';

    // Create form element
    const form = document.createElement('form');
    form.id = 'queryForm';
    form.enctype = "multipart/form-data"

    // Create text Input
    const queryLabel = document.createElement('label');
    queryLabel.textContent = 'Department ID: ';
    const inputQUERY = document.createElement('input');
    inputQUERY.type = 'text';
    inputQUERY.id = 'department_id';
    inputQUERY.name = 'department_id';
    inputQUERY.required = true;

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'button'; // Change to 'submit' if you want to submit the form
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', submitUserStoryOneForm);

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

function submitUserStoryOneForm() {
    const deptID = document.getElementById('department_id').value;
    const url = `/query`;

    const queryInput = `{
        "WHERE": {"IS": {"sections_dept":` + `\"${deptID}\"` + `}},
        "OPTIONS": {
            "COLUMNS": ["average", "sections_dept", "sections_id"],
            "ORDER": { "dir": "DOWN","keys": ["average"]}},
        "TRANSFORMATIONS": {
            "GROUP": ["sections_dept", "sections_id"],
            "APPLY": [{"average": {"AVG": "sections_avg"}}]
        }
    }`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: queryInput
    })
        .then(response => response.json())
        .then((data) => {
            // console.log(data.result.length);
            if (data.result.length < 1) {
                renderAvgForm();
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
