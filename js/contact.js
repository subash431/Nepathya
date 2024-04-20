// Get reference to the form
const form = document.querySelector('form');

// Add event listener for form submission
form.addEventListener('submit', function(event) {
  // Prevent default form submission
  event.preventDefault();
  
  // Display success message
  displaySuccessMessage();

  // Clear form fields
  clearForm();
});

// Function to display success message
function displaySuccessMessage() {
  const successToast = document.getElementById('success-toast');
  const successToastText = document.getElementById('success-toast-text');
  successToastText.textContent = 'Message sent';
  successToast.style.display = 'block';

  // Hide the success message after 3 seconds
  setTimeout(function() {
    successToast.style.display = 'none';
  }, 3000);
}

// Function to clear form fields
function clearForm() {
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('url').value = '';
  document.getElementById('yearOfBirth').value = '';
  document.getElementById('male').checked = false;
  document.getElementById('female').checked = false;
  document.getElementById('other').checked = false;
  document.getElementById('message').value = '';
  document.getElementById('confirm').checked = false;
}
