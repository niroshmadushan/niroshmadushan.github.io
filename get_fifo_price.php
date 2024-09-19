<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$productName = $input['product'];
$requestedQuantity = (int) $input['quantity'];

if (!$productName || !$requestedQuantity) {
    echo json_encode(['success' => false, 'message' => 'Invalid product or quantity']);
    exit();
}

// Path to GRN file
$grnFile = 'grn.txt';

// Fetch GRN entries (sorted by date for FIFO)
$grnLines = file($grnFile, FILE_IGNORE_NEW_LINES);
$grnEntries = [];
foreach ($grnLines as $line) {
    list($id, $product, $quantity, $price, $total, $date) = explode(',', $line);
    if ($product === $productName && (int)$quantity > 0) {
        $grnEntries[] = [
            'id' => $id,
            'product' => $product,
            'quantity' => (int)$quantity,
            'price' => (float)$price,
            'date' => $date
        ];
    }
}

// FIFO calculation to get total price
$totalPrice = 0;
$remainingQuantity = $requestedQuantity;

foreach ($grnEntries as $entry) {
    if ($remainingQuantity <= 0) break;

    if ($entry['quantity'] >= $remainingQuantity) {
        // Fulfill the remaining quantity from this batch
        $totalPrice += $remainingQuantity * $entry['price'];
        $remainingQuantity = 0;
    } else {
        // Take the entire quantity from this batch and continue
        $totalPrice += $entry['quantity'] * $entry['price'];
        $remainingQuantity -= $entry['quantity'];
    }
}

// If not enough stock
if ($remainingQuantity > 0) {
    echo json_encode(['success' => false, 'message' => 'Not enough stock available for this product']);
    exit();
}

// Calculate the average price for GON
$avgPrice = $totalPrice / $requestedQuantity;

echo json_encode(['success' => true, 'price' => $avgPrice]);
?>
