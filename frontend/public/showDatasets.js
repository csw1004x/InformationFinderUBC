// add listener for when show datasets is clicked
document.getElementById("show-datasets-button").addEventListener('click', () => {
    fetch('/dataset') // Replace with the actual API endpoint
        .then(response => response.json())
        .then(data => {
            renderTable("Show Datasets",data.result);
        })
        .catch(error => console.error('Error fetching data:', error));
});
