<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Path to the product list file
$productFile = 'productlist.txt';

// Check if the product file exists
if (!file_exists($productFile)) {
    echo json_encode(['success' => false, 'message' => 'Product list file not found']);
    exit;
}

// Read the product list file
$productLines = file($productFile, FILE_IGNORE_NEW_LINES);

// Prepare the product list for response
$productList = [];

foreach ($productLines as $line) {
    $productData = explode(',', $line);
    if (count($productData) == 2) {
        $productList[] = [
            'id' => $productData[0],
            'name' => $productData[1]
        ];
    }
}

// Return the product list as JSON
echo json_encode(['success' => true, 'products' => $productList]);
?>
