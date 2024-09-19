document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.querySelector('#usersTable tbody');
    const addUserForm = document.getElementById('addUserForm');
    const newUserNameInput = document.getElementById('newUserName');
    const newUserEmailInput = document.getElementById('newUserEmail');
    const newUserRoleSelect = document.getElementById('newUserRole');
    let users = []; // To hold user data

    // Fetch users from the server
    async function fetchUsers() {
        try {
            const response = await fetch('get_users.php');
            users = await response.json();
            renderUsersTable();
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Render the users table
    function renderUsersTable() {
        usersTableBody.innerHTML = ''; // Clear the existing table rows

        users.forEach((user, index) => {
            const row = document.createElement('tr');

            // Editable fields (email, role)
            row.innerHTML = `
                <td contenteditable="false" data-field="email">${user.email}</td>
                <td>
                    <select data-field="role" disabled>
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>
                    <select data-field="status" disabled>
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="save-btn" data-index="${index}" style="display: none;">Save</button>
                </td>
            `;

            usersTableBody.appendChild(row);
        });
    }

    // Handle edit and save button click
    usersTableBody.addEventListener('click', async (e) => {
        const index = e.target.getAttribute('data-index');
        const row = e.target.closest('tr');

        if (e.target.classList.contains('edit-btn')) {
            // Toggle fields to be editable
            toggleEditable(row, true);
            e.target.style.display = 'none';
            row.querySelector('.save-btn').style.display = 'inline-block';
        } else if (e.target.classList.contains('save-btn')) {
            const updatedUser = {
                email: row.querySelector('[data-field="email"]').innerText.trim(),
                role: row.querySelector('[data-field="role"]').value,
                status: row.querySelector('[data-field="status"]').value,
            };

            // Send the update to the server
            try {
                const response = await fetch('update_user.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedUser),
                });

                const result = await response.json();

                if (result.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'User information updated successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                    // Update the user in the local users array
                    users[index] = { ...users[index], ...updatedUser };
                    renderUsersTable(); // Re-render the table
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update user information. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });

    // Handle adding new user
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newUser = {
            name: newUserNameInput.value.trim(),
            email: newUserEmailInput.value.trim(),
            role: newUserRoleSelect.value,
        };

        try {
            const response = await fetch('add_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'User added successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                // Add the new user to the users array
                users.push(result.user);
                renderUsersTable(); // Re-render the table

                // Clear the form fields
                addUserForm.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add user. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });

    // Toggle editable fields in the row
    function toggleEditable(row, editable) {
        const emailField = row.querySelector('[data-field="email"]');
        const roleField = row.querySelector('[data-field="role"]');
        const statusField = row.querySelector('[data-field="status"]');

        emailField.contentEditable = editable;
        roleField.disabled = !editable;
        statusField.disabled = !editable;
    }

    // Initial fetch of users
    fetchUsers();
});
