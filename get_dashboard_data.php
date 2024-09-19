<?php
// Allow requests from any origin
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Path to your text files
$bookFile = 'book.txt';
$userFile = 'user.txt';
$paymentFile = 'payments.txt';

// Function to read and process booking data
function getBookingsData() {
    global $bookFile;
    $bookings = [];
    
    if (file_exists($bookFile)) {
        $file = fopen($bookFile, 'r');
        while (($line = fgetcsv($file)) !== false) {
            $bookings[] = [
                'id' => $line[0],
                'guestName' => $line[1],
                'checkIn' => $line[2],
                'checkOut' => $line[3],
                'roomType' => $line[4],
                'guests' => $line[5],
                'status' => $line[6],
                'specialRequests' => $line[7]
            ];
        }
        fclose($file);
    }

    return $bookings;
}

// Function to get user and payment details if needed (extend it based on your requirements)
function getPaymentsData() {
    global $paymentFile;
    $payments = [];

    if (file_exists($paymentFile)) {
        $file = fopen($paymentFile, 'r');
        while (($line = fgetcsv($file)) !== false) {
            $payments[] = [
                'bookingId' => $line[0],
                'paymentStatus' => $line[1]
            ];
        }
        fclose($file);
    }

    return $payments;
}

// Get data
$bookings = getBookingsData();
$payments = getPaymentsData();

// Example response: returning bookings and payment statuses
$response = [
    'success' => true,
    'bookings' => array_slice($bookings, -5), // Return only last 5 bookings
    'payments' => $payments
];

// Return response as JSON
echo json_encode($response);
