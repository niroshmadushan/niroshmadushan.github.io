<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Paths to GRN, GON, and stock files
$grnFile = 'grn.txt';
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

// Load the current GRN entries (FIFO stock)
$grnLines = file($grnFile, FILE_IGNORE_NEW_LINES);
$gonEntries = [];
$remainingQuantity = $gonQuantity;

foreach ($grnLines as &$line) {
    list($grnId, $grnProduct, $grnQuantity, $grnPrice, $grnTotal, $grnDate) = explode(',', $line);
    if ($grnProduct === $product && $remainingQuantity > 0) {
        if ($grnQuantity >= $remainingQuantity) {
            // Create a GON entry for this stock portion
            $gonEntry = [
                uniqid(), // Unique GON ID
                $product,
                $remainingQuantity,
                $grnPrice,
                $remainingQuantity * $grnPrice,
                date('Y-m-d H:i:s')
            ];

            // Save each individual GON entry to the file
            file_put_contents($gonFile, implode(',', $gonEntry) . PHP_EOL, FILE_APPEND);

            // Deduct the quantity from this GRN
            $grnQuantity -= $remainingQuantity;
            $line = "$grnId,$grnProduct,$grnQuantity,$grnPrice," . ($grnQuantity * $grnPrice) . ",$grnDate";
            $remainingQuantity = 0;
        } else {
            // Create a GON entry using the full available stock in this GRN
            $gonEntry = [
                uniqid(), // Unique GON ID
                $product,
                $grnQuantity,
                $grnPrice,
                $grnQuantity * $grnPrice,
                date('Y-m-d H:i:s')
            ];

            // Save each individual GON entry to the file
            file_put_contents($gonFile, implode(',', $gonEntry) . PHP_EOL, FILE_APPEND);

            // Update remaining required quantity
            $remainingQuantity -= $grnQuantity;
            $grnQuantity = 0; // Deplete the GRN
            $line = "$grnId,$grnProduct,$grnQuantity,$grnPrice," . ($grnQuantity * $grnPrice) . ",$grnDate";
        }
    }
}

// Update the GRN file with reduced stock
file_put_contents($grnFile, implode(PHP_EOL, $grnLines));

// Update the current stock
$currentStockLines = file($stockFile, FILE_IGNORE_NEW_LINES);
foreach ($currentStockLines as &$stockLine) {
    list($stockId, $stockProduct, $stockQuantity, $stockValue, $stockDate) = explode(',', $stockLine);
    if ($stockProduct === $product) {
        $newQuantity = $stockQuantity - $gonQuantity;
        $newValue = $newQuantity * ($stockValue / $stockQuantity); // Recalculate value based on remaining quantity
        $stockLine = "$stockId,$stockProduct,$newQuantity,$newValue," . date('Y-m-d H:i:s');
    }
}
file_put_contents($stockFile, implode(PHP_EOL, $currentStockLines));

// Respond with success
echo json_encode(['success' => true]);
?>
