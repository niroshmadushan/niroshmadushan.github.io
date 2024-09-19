<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Path to the current stock file
$stockFile = 'currentstock.txt';

// Check if the stock file exists
if (!file_exists($stockFile)) {
    echo json_encode(['success' => false, 'message' => 'Stock file not found']);
    exit;
}

$stockData = file($stockFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

// Format stock data as JSON
$stockArray = [];
foreach ($stockData as $line) {
    list($id, $product, $quantity, $value, $lastUpdated) = explode(',', $line);
    $stockArray[] = [
        'id' => (int)$id,
        'product' => $product,
        'quantity' => (float)$quantity,
        'value' => (float)$value,
        'lastUpdated' => $lastUpdated,
    ];
}

echo json_encode(['success' => true, 'stock' => $stockArray]);
?>
