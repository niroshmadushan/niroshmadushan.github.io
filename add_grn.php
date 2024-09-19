<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$grnFile = 'grn.txt';
$stockFile = 'currentstock.txt';

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['product']) || !isset($input['quantity']) || !isset($input['unitPrice'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

// Generate a new GRN ID
if (file_exists($grnFile)) {
    $lastLine = array_slice(file($grnFile), -1)[0];
    $lastId = (int) explode(',', $lastLine)[0];
    $newId = $lastId + 1;
} else {
    $newId = 1; // First GRN ID
}

// Collect GRN data
$quantity = (float)$input['quantity'];
$unitPrice = (float)$input['unitPrice'];
$totalValue = $quantity * $unitPrice;
$product = $input['product'];
$date = date('Y-m-d H:i:s');

// Save GRN entry to file
$grnData = [$newId, $product, $quantity, $unitPrice, $totalValue, $date];
file_put_contents($grnFile, implode(',', $grnData) . PHP_EOL, FILE_APPEND);

// Update or add to current stock
$updatedStock = [];
$productFound = false;

if (file_exists($stockFile)) {
    $stockLines = file($stockFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($stockLines as $line) {
        list($id, $stockProduct, $stockQuantity, $stockValue, $lastUpdated) = explode(',', $line);
        
        if ($stockProduct === $product) {
            $newQuantity = (float)$stockQuantity + $quantity;
            $newValue = (float)$stockValue + $totalValue;
            $updatedStock[] = implode(',', [$id, $stockProduct, $newQuantity, $newValue, date('Y-m-d')]);
            $productFound = true;
        } else {
            $updatedStock[] = $line;
        }
    }
}

// If the product is not found in current stock, add it
if (!$productFound) {
    $updatedStock[] = implode(',', [$newId, $product, $quantity, $totalValue, date('Y-m-d')]);
}

// Save updated stock to the current stock file
file_put_contents($stockFile, implode(PHP_EOL, $updatedStock) . PHP_EOL);

// Return success message
echo json_encode(['success' => true, 'id' => $newId]);
?>
