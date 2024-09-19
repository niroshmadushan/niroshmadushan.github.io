<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Path to the booking file
$bookingFile = 'book.txt';
$paymentFile = 'payments.txt'; // File for storing payment records

// Get the input from the request
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['guestName']) || !isset($input['guestEmail'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

// Generate a new booking ID
if (file_exists($bookingFile)) {
    $lastLine = array_slice(file($bookingFile), -1)[0];
    $lastId = (int) explode(',', $lastLine)[0];
    $newBookingId = $lastId + 1;
} else {
    $newBookingId = 1; // First booking ID
}

// Collect booking data
$bookingData = [
    $newBookingId,
    $input['guestName'],
    $input['guestPhone'],
    $input['guestEmail'],
    $input['address'],
    $input['idPassport'],
    $input['checkInDate'],
    $input['checkOutDate'],
    $input['roomType'],
    $input['numRooms'],
    $input['numGuests'],
    $input['specialRequests'],
    $input['arrivalTime'],
    $input['arrivalMeal'],
    $input['departureTime'],
    $input['departureMeal'],
    $input['userEmail'],
];

// Save booking to file
file_put_contents($bookingFile, implode(',', $bookingData) . PHP_EOL, FILE_APPEND);

// Generate a new payment ID
if (file_exists($paymentFile)) {
    $lastLine = array_slice(file($paymentFile), -1)[0];
    $lastPayId = (int) explode(',', $lastLine)[0];
    $newPaymentId = $lastPayId + 1;
} else {
    $newPaymentId = 1; // First payment ID
}

// Collect payment data
$paymentData = [
    $newPaymentId,              // Payment ID
    $newBookingId,              // Booking ID (from the new booking)
    'notset',                   // Payment method (not set yet)
    '00.00',                    // Amount paid (default)
    '00.00',                    // Balance due (default)
    date('Y/m/d'),              // Payment date (current date)
    'Pending',
    'reference'                     // Payment status (default to 'paid')
];

// Save payment record to file
file_put_contents($paymentFile, implode(',', $paymentData) . PHP_EOL, FILE_APPEND);

// Return success message
echo json_encode(['success' => true, 'message' => 'Booking and payment saved successfully']);
?>
