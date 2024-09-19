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
if (!$input || !isset($input['bookingId']) || !isset($input['paymentStatus'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

// Load the payments data
if (!file_exists($paymentFile)) {
    echo json_encode(['success' => false, 'message' => 'Payment file not found']);
    exit;
}

$payments = file($paymentFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

if ($payments === false) {
    echo json_encode(['success' => false, 'message' => 'Failed to read the file']);
    exit;
}

$updatedPayments = [];
$isUpdated = false;

// Loop through each payment entry and update the relevant one
foreach ($payments as $payment) {
    $paymentData = explode(',', $payment);
    $bookingId = $paymentData[1]; // Assuming booking ID is the second field

    // Check if this is the payment record to update
    if ($bookingId == $input['bookingId']) {
        // Update only the payment status
        $paymentData[6] = $input['paymentStatus']; // Payment status field
        $isUpdated = true;
    }

    // Add the payment record to the updated list
    $updatedPayments[] = implode(',', $paymentData);
}

// If the payment was updated, overwrite the file with the updated payment records
if ($isUpdated) {
    $writeSuccess = file_put_contents($paymentFile, implode(PHP_EOL, $updatedPayments) . PHP_EOL);

    if ($writeSuccess === false) {
        echo json_encode(['success' => false, 'message' => 'Failed to write to the file']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Payment status updated successfully']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Payment record not found']);
}
?>
