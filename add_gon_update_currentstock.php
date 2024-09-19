<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Paths to the necessary files
$gonFile = 'gon.txt';
$stockFile = 'currentstock.txt';

// Get the input from the request
$input = json_decode(file_get_contents('php://input'), true);
$product = $input['product'];
$gonQuantity = (int) $input['quantity'];

if (!$product || !$gonQuantity) {
    echo json_encode(['success' => false, 'message' => 'Invalid product or quantity']);
    exit();
}

// Load current stock data
$currentStockLines = file($stockFile, FILE_IGNORE_NEW_LINES);
$stockUpdated = false;
$updatedStockLines = [];
$remainingQuantity = $gonQuantity;
$cost = 0; // Total cost for the GON

// Process the stock reduction using FIFO logic
foreach ($currentStockLines as &$stockLine) {
    list($stockId, $stockProduct, $stockQuantity, $stockValue, $stockDate) = explode(',', $stockLine);

    if ($stockProduct === $product && $remainingQuantity > 0) {
        $unitPrice = $stockValue / $stockQuantity; // Calculate unit price

        if ($stockQuantity >= $remainingQuantity) {
            // Record the GON entry
            $gonEntry = [
                uniqid(), // Unique GON ID
                $product,
                $remainingQuantity,
                $unitPrice,
                $remainingQuantity * $unitPrice, // Total cost
                date('Y-m-d H:i:s')
            ];

            // Write the GON entry to gon.txt
            file_put_contents($gonFile, implode(',', $gonEntry) . PHP_EOL, FILE_APPEND);

            // Deduct from current stock
            $stockQuantity -= $remainingQuantity;
            $stockValue = $stockQuantity * $unitPrice;
            $stockLine = "$stockId,$stockProduct,$stockQuantity,$stockValue," . date('Y-m-d H:i:s');
            $cost += $remainingQuantity * $unitPrice;
            $remainingQuantity = 0;
        } else {
            // Use the full stock quantity
            $gonEntry = [
                uniqid(), // Unique GON ID
                $product,
                $stockQuantity,
                $unitPrice,
                $stockQuantity * $unitPrice,
                date('Y-m-d H:i:s')
            ];

            // Write the GON entry to gon.txt
            file_put_contents($gonFile, implode(',', $gonEntry) . PHP_EOL, FILE_APPEND);

            $remainingQuantity -= $stockQuantity;
            $cost += $stockQuantity * $unitPrice;
            $stockQuantity = 0;
            $stockLine = "$stockId,$stockProduct,0,0," . date('Y-m-d H:i:s'); // Stock depleted
        }
        $stockUpdated = true;
    }

    $updatedStockLines[] = $stockLine;
}

// If no stock was updated, return an error
if (!$stockUpdated) {
    echo json_encode(['success' => false, 'message' => 'Product not found in current stock']);
    exit;
}

// Write the updated stock data back to currentstock.txt
file_put_contents($stockFile, implode(PHP_EOL, $updatedStockLines));

// Respond with success
echo json_encode(['success' => true, 'totalCost' => $cost]);
?>
