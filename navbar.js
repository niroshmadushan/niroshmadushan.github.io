// navbar.js

// Function to handle navigation
function navigateTo(path) {
    // Redirect to the specified path
    window.location.href = path;
}

// Function to handle logout
function handleLogout() {
    // Remove the user session or token
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    // Redirect to the login page
    window.location.href = 'index.html';
}

// Ensure that the functions are available for use
window.navigateTo = navigateTo;
window.handleLogout = handleLogout;
