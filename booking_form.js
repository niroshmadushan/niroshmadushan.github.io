// booking_form.js
document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect form values
        const formValues = {
            guestName: document.getElementById('guestName').value.trim(),
            guestPhone: document.getElementById('guestPhone').value.trim(),
            guestEmail: document.getElementById('guestEmail').value.trim(),
            address: document.getElementById('address').value.trim(),
            idPassport: document.getElementById('idPassport').value.trim(),
            checkInDate: document.getElementById('checkInDate').value,
            checkOutDate: document.getElementById('checkOutDate').value,
            roomType: document.getElementById('roomType').value,
            numRooms: document.getElementById('numRooms').value,
            numGuests: document.getElementById('numGuests').value,
            specialRequests: document.getElementById('specialRequests').value.trim(),
            arrivalTime: document.getElementById('arrivalTime').value,
            arrivalMeal: document.getElementById('arrivalMeal').value,
            departureTime: document.getElementById('departureTime').value,
            departureMeal: document.getElementById('departureMeal').value,
            userEmail: localStorage.getItem('userEmail')
        };

        // Validate form
        if (validate(formValues)) {
            try {
                // Send data to the server
                const response = await fetch('add_booking.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formValues)
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Booking added successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                    // Reset form fields
                    bookingForm.reset();
                } else {
                    throw new Error('Failed to add booking');
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'There was an error saving the booking. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            Swal.fire({
                title: 'Warning!',
                text: 'Please fill in all required fields correctly.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    });

    // Validate form function
    function validate(values) {
        let isValid = true;

        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // Validate each field
        if (!values.guestName) {
            document.getElementById('error-guestName').textContent = 'Guest name is required';
            isValid = false;
        }
        if (!/^\d+$/.test(values.guestPhone)) {
            document.getElementById('error-guestPhone').textContent = 'Phone number can only contain digits';
            isValid = false;
        } else if (values.guestPhone.length < 7 || values.guestPhone.length > 15) {
            document.getElementById('error-guestPhone').textContent = 'Phone number must be between 7 and 15 digits';
            isValid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.guestEmail)) {
            document.getElementById('error-guestEmail').textContent = 'Enter a valid email';
            isValid = false;
        }

        // Validate address
        // Check if the address contains ',' or '/'
        if (!values.address) {
            document.getElementById('error-address').textContent = 'Address is required';
            isValid = false;
        } else if (/[,\/]/.test(values.address)) {
            // Automatically replace ',' and '/' with '-'
            values.address = values.address.replace(/[,/]/g, '-');
            document.getElementById('address').value = values.address; // Update the input field
        }

        if (!values.idPassport) {
            document.getElementById('error-idPassport').textContent = 'ID/Passport No is required';
            isValid = false;
        }
        if (!values.checkInDate) {
            document.getElementById('error-checkInDate').textContent = 'Check-in date is required';
            isValid = false;
        }
        if (!values.checkOutDate) {
            document.getElementById('error-checkOutDate').textContent = 'Check-out date is required';
            isValid = false;
        } else if (new Date(values.checkOutDate) <= new Date(values.checkInDate)) {
            document.getElementById('error-checkOutDate').textContent = 'Check-out date must be after check-in date';
            isValid = false;
        }

        // Room Type validation
        if (!values.roomType) {
            document.getElementById('error-roomType').textContent = 'Room type is required';
            isValid = false;
        }

        if (!values.arrivalTime) {
            document.getElementById('error-arrivalTime').textContent = 'Arrival time is required';
            isValid = false;
        }
        if (!values.departureTime) {
            document.getElementById('error-departureTime').textContent = 'Departure time is required';
            isValid = false;
        }
        if (!values.arrivalMeal) {
            document.getElementById('error-arrivalMeal').textContent = 'Arriving meal selection is required';
            isValid = false;
        }
        if (!values.departureMeal) {
            document.getElementById('error-departureMeal').textContent = 'Departure meal selection is required';
            isValid = false;
        }

        if (values.numRooms <= 0) {
            document.getElementById('error-numRooms').textContent = 'Number of rooms must be at least 1';
            isValid = false;
        }
        if (values.numGuests < 1 || values.numGuests > 100000) {
            document.getElementById('error-numGuests').textContent = 'Number of guests must be between 1 and 100,000';
            isValid = false;
        }

        // Validate special requests (NEW)
        // Automatically replace ',' and '/' with '-'
        if (values.specialRequests) {
            values.specialRequests = values.specialRequests.replace(/[,/]/g, ' - ');
            document.getElementById('specialRequests').value = values.specialRequests; // Update the input field
        }

        return isValid;
    }
});
