<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$paymentsFile = 'path_to/payments.txt'; // Update with the actual path to your payments.txt file

$payments = [];

if (file_exists($paymentsFile)) {
    $file = fopen($paymentsFile, 'r');
    
    while (($line = fgets($file)) !== false) {
        $fields = explode(',', trim($line));
        
        // Make sure we have exactly 6 fields to prevent errors
        if (count($fields) === 6) {
            $payments[] = [
                'payid' => $fields[0],
                'bookid' => $fields[1],
                'method' => $fields[2],
                'amountToPay' => floatval($fields[3]), // Convert amount to a float
                'balanceDue' => floatval($fields[4]),  // Convert balance to a float
                'paymentDate' => $fields[5],
                'paymentStatus' => $fields[6],
            ];
        }
    }
    
    fclose($file);
}

echo json_encode($payments);
?>
