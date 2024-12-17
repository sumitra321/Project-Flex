// Work With Us Form Submission (Handling Form and Saving Data)
document.getElementById("work-form").addEventListener("submit", function(e) {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
  
    // Send data to server (PHP/Node.js) for saving in a file
    fetch('save_to_file.php', {
      method: 'POST',
      body: JSON.stringify({ name, email, message })
    })
    .then(response => response.text())
    .then(data => alert("Your details have been submitted successfully!"))
    .catch(error => console.error("Error:", error));
  });
  