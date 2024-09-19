<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// File paths for bookings and payments
$bookingsFile = 'book.txt';  // Update with correct path
$paymentsFile = 'payments.txt';  // Update with correct path

$bookings = [];
$payments = [];

// Read the payments.txt file and store payments information
if (file_exists($paymentsFile)) {
    $file = fopen($paymentsFile, 'r');
    while (($line = fgets($file)) !== false) {
        $fields = explode(',', trim($line));
        if (count($fields) === 6) {
            $payments[$fields[0]] = [
                'paymentMethod' => $fields[1],
                'amountToPay' => floatval($fields[2]),
                'balanceDue' => floatval($fields[3]),
                'paymentDate' => $fields[4],
                'paymentStatus' => $fields[5]
            ];
        }
    }
    fclose($file);
}

// Read the book.txt file and merge booking information with payments
if (file_exists($bookingsFile)) {
    $file = fopen($bookingsFile, 'r');
    while (($line = fgets($file)) !== false) {
        $fields = explode(',', trim($line));
        if (count($fields) === 14) {
            $bookingId = $fields[0];
            $bookings[] = [
                'id' => $bookingId,
                'guestName' => $fields[1],
                'contactInfo' => $fields[2] . ', ' . $fields[3], // Email and phone
                'address' => $fields[4],
                'nicPassport' => $fields[5],
                'checkIn' => $fields[6],
                'checkOut' => $fields[7],
                'roomType' => $fields[8],
                'guests' => intval($fields[9]),
                'specialRequest' => $fields[10],
                'arrivalTime' => $fields[11],
                'departureTime' => $fields[12],
                'departureMeal' => $fields[13],
                'payment' => isset($payments[$bookingId]) ? $payments[$bookingId] : null
            ];
        }
    }
    fclose($file);
}

echo json_encode($bookings);
?>
