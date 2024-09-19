<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$productFile = 'productlist.txt';

// Check if the file exists
if (!file_exists($productFile)) {
    echo json_encode([]);
    exit();
}

// Read the product file
$products = file($productFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

// Format the products
$productList = array_map(function($line) {
    list($id, $name, $unitPrice) = explode(',', $line);
    return ['id' => $id, 'name' => $name, 'unitPrice' => $unitPrice];
}, $products);

echo json_encode($productList);
?>
