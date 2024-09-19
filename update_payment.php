<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Path to the payment file
$paymentFile = 'payments.txt';

// Get the input from the request
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['bookingId']) || !isset($input['amountPaid']) || !isset($input['reference'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

// Load the payments data
if (!file_exists($paymentFile)) {
    echo json_encode(['success' => false, 'message' => 'Payment file not found']);
    exit;
}

$payments = file($paymentFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$updatedPayments = [];
$isUpdated = false;

// Loop through each payment entry and update the relevant one
foreach ($payments as $payment) {
    $paymentData = explode(',', $payment);
    $paymentId = $paymentData[0];
    $bookingId = $paymentData[1];

    // Check if this is the payment record to update
    if ($bookingId == $input['bookingId']) {
        // Update the payment details
        $paymentData[2] = $input['paymentMethod']; // Payment method
        $paymentData[3] = $input['amountPaid'];    // Amount paid
        $paymentData[4] = $input['balanceDue'];    // Balance due
        $paymentData[5] = $input['paymentDate'];   // Payment date
        $paymentData[6] = $input['paymentStatus']; // Payment status (e.g., Paid)
        $paymentData[7] = $input['reference'];     // Reference

        $isUpdated = true;
    }

    // Add the payment record to the updated list
    $updatedPayments[] = implode(',', $paymentData);
}

// If the payment was updated, overwrite the file with the updated payment records
if ($isUpdated) {
    file_put_contents($paymentFile, implode(PHP_EOL, $updatedPayments) . PHP_EOL);
    echo json_encode(['success' => true, 'message' => 'Payment updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Payment record not found']);
}
?>
