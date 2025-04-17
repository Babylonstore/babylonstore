document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'admin-dashboard.html';
    }

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (in a real app, this should be server-side)
        // For demo purposes, username: admin, password: admin123
        if (username === 'admin' && password === 'admin123') {
            // Set login status in localStorage
            localStorage.setItem('adminLoggedIn', 'true');
            
            // Redirect to dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            // Show error message
            loginError.textContent = 'Invalid username or password';
            loginError.style.display = 'block';
        }
    });
});