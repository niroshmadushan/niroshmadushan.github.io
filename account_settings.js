// account_settings.js
document.addEventListener('DOMContentLoaded', () => {
    const accountSettingsForm = document.getElementById('accountSettingsForm');
    const emailInput = document.getElementById('email');
    const roleInput = document.getElementById('role');
    const currentPasswordInput = document.getElementById('currentPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleCurrentPassword = document.getElementById('toggleCurrentPassword');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    // Load user details from local storage
    const email = localStorage.getItem('userEmail'); // Get the email from local storage
    const role = localStorage.getItem('userRole'); // Get the role from local storage
    
    if (email && role) {
        emailInput.value = email; // Set the email input value
        roleInput.value = role; // Set the role input value
    }

    // Toggle password visibility
    toggleCurrentPassword.addEventListener('click', () => {
        const type = currentPasswordInput.type === 'password' ? 'text' : 'password';
        currentPasswordInput.type = type;
        toggleCurrentPassword.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
        confirmPasswordInput.type = type;
        toggleConfirmPassword.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Handle form submission
    accountSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate that the new password and confirm password match
        if (passwordInput.value !== confirmPasswordInput.value) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'New passwords do not match!',
            });
            return;
        }

        // Check if the current and new passwords are provided
        if (!passwordInput.value || !currentPasswordInput.value) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Both current and new passwords must be filled!',
            });
            return;
        }

        try {
            // Send current password, new password, and email to the backend
            const response = await fetch('update_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailInput.value,
                    currentPassword: currentPasswordInput.value,
                    newPassword: passwordInput.value,
                }),
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password updated successfully!',
                });
                accountSettingsForm.reset();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong while updating the password!',
            });
        }
    });
});
