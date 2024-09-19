// payment_form.js
document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('paymentForm');
    const bookingDetailsDiv = document.getElementById('bookingDetails');
    const bookingIdInput = document.getElementById('bookingId');
    const paymentMethodInput = document.getElementById('paymentMethod');
    const amountPaidInput = document.getElementById('amountPaid');
    const balanceDueInput = document.getElementById('balanceDue');
    const paymentDateInput = document.getElementById('paymentDate');
    const paymentStatusInput = document.getElementById('paymentStatus');
    const referenceInput = document.getElementById('reference'); // New reference field
    const submitBtn = document.getElementById('submitBtn');
    const paidMessage = document.getElementById('paidMessage');

    let bookingInfo = [];
    let paymentInfo = [];

    // Fetch booking and payment details
    const fetchData = async () => {
        try {
            const response = await fetch('get_all_booking_payment_details.php');
            const data = await response.json();
            bookingInfo = data.bookingData;
            paymentInfo = data.paymentData;
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch booking and payment details!',
            });
        }
    };

    fetchData(); // Initial fetch on page load

    // Handle form change
    bookingIdInput.addEventListener('input', () => {
        const bookingId = bookingIdInput.value.trim();
        const payment = paymentInfo.find((p) => p.bookingId === bookingId);

        // Check if payment status is 'Paid'
        if (payment && payment.paymentStatus === 'Paid') {
            setFormDisabled(true);
            paidMessage.textContent = '*This booking has already been paid. You cannot make a new payment for this booking.';
        } else {
            setFormDisabled(false);
            paidMessage.textContent = '';
        }

        // Display booking and guest details
        displayBookingDetails(bookingId);
    });

    // Disable/Enable form fields based on payment status
    function setFormDisabled(disabled) {
        submitBtn.disabled = disabled;
        paymentMethodInput.disabled = disabled;
        amountPaidInput.disabled = disabled;
        balanceDueInput.disabled = disabled;
        paymentDateInput.disabled = disabled;
        paymentStatusInput.disabled = disabled;
        referenceInput.disabled = disabled; // Disable the new reference field
    }

    // Handle form submission
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please correct the errors in the form.',
            });
            return;
        }

        const formData = new FormData(paymentForm);
        const paymentDetails = Object.fromEntries(formData.entries());

        if (submitBtn.disabled) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'This booking has already been paid!',
            });
            return;
        }

        try {
            const response = await fetch('update_payment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentDetails),
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Payment updated successfully!',
                });

                // Reset the form
                paymentForm.reset();
                fetchData(); // Refresh data
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
                text: 'Failed to update the payment. Please try again.',
            });
        }
    });

    // Display booking and guest details
    function displayBookingDetails(bookingId) {
        const booking = bookingInfo.find((b) => b.bookingId === bookingId);
        if (booking) {
            bookingDetailsDiv.innerHTML = `
                <p><strong>Guest Name:</strong> ${booking.guestName}</p>
                <p><strong>Guest Phone:</strong> ${booking.guestPhone}</p>
                <p><strong>Guest Email:</strong> ${booking.guestEmail}</p>
                <p><strong>ID/Passport:</strong> ${booking.idPassport}</p>
                <p><strong>Address:</strong> ${booking.address}</p>
                <p><strong>Check-In Date:</strong> ${booking.checkInDate}</p>
                <p><strong>Check-Out Date:</strong> ${booking.checkOutDate}</p>
                <p><strong>Room Type:</strong> ${booking.roomType}</p>
                <p><strong>Number of Rooms:</strong> ${booking.numRooms}</p>
                <p><strong>Guests:</strong> ${booking.numGuests}</p>
                <p><strong>Arrival Time:</strong> ${booking.arrivalTime}</p>
                <p><strong>Departure Time:</strong> ${booking.departureTime}</p>
                <p><strong>Arrival Meal:</strong> ${booking.arrivalMeal}</p>
                <p><strong>Departure Meal:</strong> ${booking.departureMeal}</p>
                <p><strong>Special Requests:</strong> ${booking.specialRequests}</p>
            `;
        } else {
            bookingDetailsDiv.innerHTML = '<p>Enter a valid Booking ID to see details.</p>';
        }
    }

    // Form validation
    function validateForm() {
        let isValid = true;

        // Validate Booking ID
        if (!bookingIdInput.value.trim()) {
            isValid = false;
            showError(bookingIdInput, 'Booking ID is required.');
        } else {
            clearError(bookingIdInput);
        }

        // Validate Payment Method
        if (!paymentMethodInput.value) {
            isValid = false;
            showError(paymentMethodInput, 'Please select a payment method.');
        } else {
            clearError(paymentMethodInput);
        }

        // Validate Amount Paid
        if (!amountPaidInput.value || parseFloat(amountPaidInput.value) <= 0) {
            isValid = false;
            showError(amountPaidInput, 'Please enter a valid amount.');
        } else {
            clearError(amountPaidInput);
        }

        // Validate Balance Due
        if (!balanceDueInput.value || parseFloat(balanceDueInput.value) < 0) {
            isValid = false;
            showError(balanceDueInput, 'Please enter a valid balance due.');
        } else {
            clearError(balanceDueInput);
        }

        // Validate Payment Date
        if (!paymentDateInput.value) {
            isValid = false;
            showError(paymentDateInput, 'Payment date is required.');
        } else {
            clearError(paymentDateInput);
        }

        // Validate Reference
        if (!referenceInput.value.trim()) {
            isValid = false;
            showError(referenceInput, 'Reference is required.');
        } else {
            clearError(referenceInput);
        }

        return isValid;
    }

    // Show error message
    function showError(inputElement, message) {
        inputElement.classList.add('input-error');
        const errorDiv = inputElement.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
        } else {
            const errorSpan = document.createElement('span');
            errorSpan.classList.add('error-message');
            errorSpan.textContent = message;
            inputElement.parentElement.appendChild(errorSpan);
        }
    }

    // Clear error message
    function clearError(inputElement) {
        inputElement.classList.remove('input-error');
        const errorDiv = inputElement.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }
});
