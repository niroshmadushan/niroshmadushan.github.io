<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Paths to the booking and payment files
$bookingFile = 'book.txt';
$paymentFile = 'payments.txt';

// Function to read a file and return the data as an array of associative arrays
function readFileToArray($filePath, $keys) {
    if (!file_exists($filePath)) {
        return [];
    }
    
    $fileContents = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $data = [];

    foreach ($fileContents as $line) {
        $values = explode(',', $line);

        // Check if the number of values matches the number of keys
        if (count($values) !== count($keys)) {
            error_log("Error: The number of values in the line does not match the number of keys. Line: $line");
            continue; // Skip this line and log the error
        }

        $data[] = array_combine($keys, $values);
    }

    return $data;
}

// Define the keys for booking and payment records
$bookingKeys = [
    'bookingId', 'guestName', 'guestPhone', 'guestEmail', 'address', 'idPassport',
    'checkInDate', 'checkOutDate', 'roomType', 'numRooms', 'numGuests', 'specialRequests',
    'arrivalTime', 'arrivalMeal', 'departureTime', 'departureMeal','userEmail'
];

$paymentKeys = [
    'paymentId', 'bookingId', 'paymentMethod', 'amountPaid', 'balanceDue', 'paymentDate', 'paymentStatus', 'reference'
];

// Read booking and payment data
$bookingData = readFileToArray($bookingFile, $bookingKeys);
$paymentData = readFileToArray($paymentFile, $paymentKeys);

// Check if json_encode fails
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('JSON Encoding Error: ' . json_last_error_msg());
    echo json_encode(['error' => 'Internal Server Error']);
    exit;
}

// Return both booking and payment data as JSON
echo json_encode(['bookingData' => $bookingData, 'paymentData' => $paymentData]);
?>
