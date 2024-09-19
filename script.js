// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const modal = document.getElementById('bookingModal');
    const modalContent = document.getElementById('bookingDetails');
    const closeModal = document.getElementsByClassName('close')[0];

    // Fetch and display booking data
    loadBookingData();

    // Load booking data from PHP backend
    async function loadBookingData() {
        try {
            const response = await fetch('get_all_booking_payment_details.php');
            const data = await response.json();
            const bookingData = data.bookingData;
            const paymentData = data.paymentData;

            // Update metrics
            document.getElementById('totalBookingsCount').textContent = bookingData.length;
            const pendingPaymentsCount = paymentData.filter(payment => payment.paymentStatus === 'Pending').length;
            document.getElementById('pendingPaymentsCount').textContent = pendingPaymentsCount;
            const pendingPaymentsCount1 = paymentData.filter(payment => payment.paymentStatus === 'Paid').length;
            document.getElementById('pendingPaymentsCount1').textContent = pendingPaymentsCount1;
            const pendingPaymentsCount2 = paymentData.filter(payment => payment.paymentStatus === 'Cansel').length;
            document.getElementById('pendingPaymentsCount2').textContent = pendingPaymentsCount2;
            

            // Populate recent bookings table
            const bookingsTableBody = document.getElementById('bookingsTable').getElementsByTagName('tbody')[0];
            bookingsTableBody.innerHTML = ''; // Clear any existing rows

            bookingData.slice(-10).forEach(booking => {
                const row = bookingsTableBody.insertRow();
                row.innerHTML = `
                    <td>${booking.bookingId}</td>
                    <td>${booking.guestName}</td>
                    <td>${booking.checkInDate}</td>
                    <td>${booking.checkOutDate}</td>
                    <td>${booking.roomType}</td>
                    <td>${booking.numGuests}</td>
                    <td>${booking.userEmail}</td>
                    <td>${getBookingPaymentStatus(paymentData, booking.bookingId)}</td>
                `;
                row.addEventListener('click', () => openModal(booking, paymentData));
            });
        } catch (error) {
            alert('Failed to load booking or payment data.');
            console.error('Error:', error);
        }
    }

    // Get payment status for a booking
    function getBookingPaymentStatus(paymentData, bookingId) {
        const payment = paymentData.find(p => p.bookingId === bookingId);
        return payment ? payment.paymentStatus : 'Unknown';
    }

    // Open modal with booking details in two-column layout
    function openModal(booking, paymentData) {
        // Find the corresponding payment data using the booking ID
        const payment = paymentData.find(p => p.bookingId === booking.bookingId);
    
        // Open the modal
        modal.style.display = 'block';
    
        // Set the modal content
        modalContent.innerHTML = `
            <h3>Booking Details</h3>
            <div class="modal-content-columns">
                ${createModalRow('Guest Name:', booking.guestName)}
                ${createModalRow('Phone:', booking.guestPhone)}
                ${createModalRow('Email:', booking.guestEmail)}
                ${createModalRow('Address:', booking.address)}
                ${createModalRow('ID/Passport:', booking.idPassport)}
                ${createModalRow('Check-In:', booking.checkInDate)}
                ${createModalRow('Check-Out:', booking.checkOutDate)}
                ${createModalRow('Room Type:', booking.roomType)}
                ${createModalRow('Number of Rooms:', booking.numRooms)}
                ${createModalRow('Number of Guests:', booking.numGuests)}
                ${createModalRow('Special Requests:', booking.specialRequests)}
                ${createModalRow('Arrival Time:', booking.arrivalTime)}
                ${createModalRow('Arrival Meal:', booking.arrivalMeal)}
                ${createModalRow('Departure Time:', booking.departureTime)}
                ${createModalRow('Departure Meal:', booking.departureMeal)}
                 ${createModalRow('user Email:', booking.userEmail)}
            </div>
            <h3>Payment Details</h3>
            <div class="modal-content-columns">
                ${createModalRow('Payment ID:', payment ? payment.paymentId : 'N/A')}
                ${createModalRow('Payment Method:', payment ? payment.paymentMethod : 'N/A')}
                ${createModalRow('Amount Paid:', payment ? payment.amountPaid : 'N/A')}
                ${createModalRow('Balance Due:', payment ? payment.balanceDue : 'N/A')}
                ${createModalRow('Payment Date:', payment ? payment.paymentDate : 'N/A')}
                ${createModalRow('Payment Status:', payment ? payment.paymentStatus : 'N/A')}
                ${createModalRow('Payment reference:', payment ? payment.reference : 'N/A')}
            </div>
        `;
    }
    
    // Helper function to create a modal row
    function createModalRow(label, value) {
        return `
            <div class="modal-row">
                <div class="modal-label">${label}</div>
                <div class="modal-value">${value}</div>
            </div>
        `;
    }
    
    // Close the modal
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});
