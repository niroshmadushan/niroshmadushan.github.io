<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$productFile = 'productlist.txt';
$currentStockFile = 'currentstock.txt';

// Read product list
$productList = file_exists($productFile) ? file($productFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
$products = [];
foreach ($productList as $product) {
    list($id, $name, $unitPrice) = explode(',', $product);
    $products[$id] = ['id' => $id, 'name' => $name, 'unitPrice' => $unitPrice];
}

// Read current stock
$stockList = file_exists($currentStockFile) ? file($currentStockFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
foreach ($stockList as $stock) {
    list($productId, $quantity) = explode(',', $stock);
    if (isset($products[$productId])) {
        $products[$productId]['quantity'] = $quantity;
    }
}

// Return the combined inventory data
echo json_encode(array_values($products));
?>
