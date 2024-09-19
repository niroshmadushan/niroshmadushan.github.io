<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Path to the productlist.txt file
$productFile = 'productlist.txt';

// Get the input data (product name) from the request
$input = json_decode(file_get_contents('php://input'), true);
$productName = isset($input['name']) ? trim($input['name']) : '';

// Validate product name
if (empty($productName)) {
    echo json_encode(['success' => false, 'message' => 'Product name is required']);
    exit();
}

// Generate a new ID for the product
if (file_exists($productFile) && filesize($productFile) > 0) {
    $lastLine = array_slice(file($productFile), -1)[0];
    $lastId = (int) explode(',', $lastLine)[0];
    $newId = $lastId + 1;
} else {
    $newId = 1; // First product ID
}

// Prepare the new product entry (ID and product name)
$newProductEntry = "$newId,$productName" . PHP_EOL;

// Append the new product to the file
file_put_contents($productFile, $newProductEntry, FILE_APPEND);

// Return success response
echo json_encode(['success' => true, 'message' => 'Product added successfully', 'id' => $newId, 'name' => $productName]);
?>
