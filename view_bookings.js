// view_bookings.js
document.addEventListener('DOMContentLoaded', () => {
    // Define DOM elements
    const bookingsTableBody = document.querySelector('#bookingsTable tbody');
    const bookingModal = document.getElementById('bookingModal');
    const bookingDetails = document.getElementById('bookingDetails');
    const searchTermInput = document.getElementById('searchTerm');
    const statusFilterInput = document.getElementById('statusFilter');
    const searchBtn = document.getElementById('searchBtn');
    const printPdfBtn = document.getElementById('printPdfBtn');
    const closeModalBtn = document.querySelector('.close');
    
    // Variables for storing booking and payment data
    let bookings = [];
    let payments = [];
    let selectedBooking = null;

    // Fetch booking and payment data from the PHP backend
    async function fetchBookings() {
        try {
            const response = await fetch('get_all_booking_payment_details.php');
            const data = await response.json();
            bookings = data.bookingData;
            payments = data.paymentData;
            displayBookings(bookings); // Display bookings in the table
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    }

    // Display bookings in the table
    function displayBookings(bookings) {
        bookingsTableBody.innerHTML = ''; // Clear existing rows
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.bookingId}</td>
                <td>${booking.guestName}</td>
                <td>${booking.idPassport}</td>
                <td>${booking.checkInDate}</td>
                <td>${booking.checkOutDate}</td>
                <td>${booking.roomType}</td>
                <td>${booking.numGuests}</td>
                 <td>${booking.userEmail}</td>
                <td>${getBookingPaymentStatus(booking.bookingId)}</td>
            `;
            // Add click event listener to open the modal
            row.addEventListener('click', () => openModal(booking));
            bookingsTableBody.appendChild(row);
        });
    }

    // Get payment status for a booking
    function getBookingPaymentStatus(bookingId) {
        const payment = payments.find(p => p.bookingId === bookingId);
        return payment ? payment.paymentStatus : 'Unknown';
    }

    // Open the modal with booking and payment details in a two-column layout
    function openModal(booking) {
        selectedBooking = booking;
        const payment = payments.find(p => p.bookingId === booking.bookingId);
        bookingModal.style.display = 'block';

        // Set the modal content
        bookingDetails.innerHTML = `
            <h3>Booking Details</h3>
            <div class="modal-content-columns">
                ${createModalRow('Booking ID:', booking.bookingId)}
                ${createModalRow('Guest Name:', booking.guestName)}
                ${createModalRow('NIC/Passport ID:', booking.idPassport)}
                ${createModalRow('Email:', booking.guestEmail)}
                ${createModalRow('Phone Number:', booking.guestPhone)}
                ${createModalRow('Address:', booking.address)}
                ${createModalRow('Check-In Date:', booking.checkInDate)}
                ${createModalRow('Check-Out Date:', booking.checkOutDate)}
                ${createModalRow('Room Type:', booking.roomType)}
                ${createModalRow('Number of Rooms:', booking.numRooms)}
                ${createModalRow('Number of Guests:', booking.numGuests)}
                ${createModalRow('Special Requests:', booking.specialRequests)}
                ${createModalRow('Arrival Time:', booking.arrivalTime)}
                ${createModalRow('Departure Time:', booking.departureTime)}
                ${createModalRow('Arrival Meal:', booking.arrivalMeal)}
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
                ${createModalRow('Payment Reference:', payment ? payment.reference : 'N/A')}
            </div>
        `;
    }

    // Helper function to create a modal row with label and value
    function createModalRow(label, value) {
        return `
            <div class="modal-row">
                <div class="modal-label">${label}</div>
                <div class="modal-value">${value}</div>
            </div>
        `;
    }

    // Close the modal
    closeModalBtn.onclick = function() {
        bookingModal.style.display = 'none';
    };

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == bookingModal) {
            bookingModal.style.display = 'none';
        }
    };

    // Search and filter bookings
    searchBtn.onclick = function() {
        const searchTerm = searchTermInput.value.toLowerCase();
        const statusFilter = statusFilterInput.value;
        const filteredBookings = bookings.filter(booking => {
            const matchesSearchTerm = 
                booking.bookingId.toString().includes(searchTerm) ||
                booking.guestName.toLowerCase().includes(searchTerm) ||
                booking.idPassport.includes(searchTerm);

            const paymentStatus = getBookingPaymentStatus(booking.bookingId);
            const matchesStatusFilter = statusFilter ? paymentStatus === statusFilter : true;

            return matchesSearchTerm && matchesStatusFilter;
        });
        displayBookings(filteredBookings);
    };

    // Generate and print the booking details using the browser's print functionality
   // Event listener for generating the PDF report
// Event listener for generating the PDF report and opening it in a new window
printPdfBtn.onclick = function() {
    if (!selectedBooking) return;

    // Find the payment details for the selected booking
    const payment = payments.find(p => p.bookingId === selectedBooking.bookingId);

    // Create the printable content with a two-column layout, enhanced for report generation
    const printableContent = `
        <html>
        <head>
            <title>Booking and Payment Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                h2 {
                    text-align: center;
                    color: #333;
                }
                h3 {
                    color: #333;
                    border-bottom: 2px solid #1976d2;
                    padding-bottom: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                td {
                    padding: 8px;
                    border: 1px solid #ccc;
                }
                .content-container {
                    margin-bottom: 40px;
                }
                .print-footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #555;
                }
                hr {
                    border: none;
                    border-top: 1px solid #ccc;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="content-container">
                <h2>Booking and Payment Report</h2>
                <hr>
                
                <h3>Booking Details</h3>
                <table>
                    <tr>
                        <td><strong>Booking ID:</strong></td>
                        <td>${selectedBooking.bookingId}</td>
                    </tr>
                    <tr>
                        <td><strong>Guest Name:</strong></td>
                        <td>${selectedBooking.guestName}</td>
                    </tr>
                    <tr>
                        <td><strong>NIC/Passport ID:</strong></td>
                        <td>${selectedBooking.idPassport}</td>
                    </tr>
                    <tr>
                        <td><strong>Email:</strong></td>
                        <td>${selectedBooking.guestEmail}</td>
                    </tr>
                    <tr>
                        <td><strong>Phone Number:</strong></td>
                        <td>${selectedBooking.guestPhone}</td>
                    </tr>
                    <tr>
                        <td><strong>Address:</strong></td>
                        <td>${selectedBooking.address}</td>
                    </tr>
                    <tr>
                        <td><strong>Check-In Date:</strong></td>
                        <td>${selectedBooking.checkInDate}</td>
                    </tr>
                    <tr>
                        <td><strong>Check-Out Date:</strong></td>
                        <td>${selectedBooking.checkOutDate}</td>
                    </tr>
                    <tr>
                        <td><strong>Room Type:</strong></td>
                        <td>${selectedBooking.roomType}</td>
                    </tr>
                    <tr>
                        <td><strong>Number of Rooms:</strong></td>
                        <td>${selectedBooking.numRooms}</td>
                    </tr>
                    <tr>
                        <td><strong>Number of Guests:</strong></td>
                        <td>${selectedBooking.numGuests}</td>
                    </tr>
                    <tr>
                        <td><strong>Special Requests:</strong></td>
                        <td>${selectedBooking.specialRequests}</td>
                    </tr>
                    <tr>
                        <td><strong>Arrival Time:</strong></td>
                        <td>${selectedBooking.arrivalTime}</td>
                    </tr>
                    <tr>
                        <td><strong>Departure Time:</strong></td>
                        <td>${selectedBooking.departureTime}</td>
                    </tr>
                      <tr>
                        <td><strong>User Emil:</strong></td>
                        <td>${selectedBooking.userEmail}</td>
                    </tr>
                </table>

                <h3>Payment Details</h3>
                <table>
                    <tr>
                        <td><strong>Payment ID:</strong></td>
                        <td>${payment ? payment.paymentId : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Payment Method:</strong></td>
                        <td>${payment ? payment.paymentMethod : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Amount Paid (Rs.):</strong></td>
                        <td>${payment ? payment.amountPaid : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Balance Due (Rs.):</strong></td>
                        <td>${payment ? payment.balanceDue : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Payment Date:</strong></td>
                        <td>${payment ? payment.paymentDate : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Payment Status:</strong></td>
                        <td>${payment ? payment.paymentStatus : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Payment Reference:</strong></td>
                        <td>${payment ? payment.reference : 'N/A'}</td>
                    </tr>
                </table>
                
                <hr>
                <p class="print-footer">Report generated by Connex IT Booking System</p>
            </div>
        </body>
        </html>
    `;

    // Open a new window
    const reportWindow = window.open('', '_blank', 'width=800,height=600');

    // Write the content to the new window
    reportWindow.document.write(printableContent);
    reportWindow.document.close();

    // Wait for the content to load before triggering the print dialog
    reportWindow.onload = function() {
        reportWindow.print();
        reportWindow.close();
    };
};

    

    // Initial data fetch
    fetchBookings();
});
