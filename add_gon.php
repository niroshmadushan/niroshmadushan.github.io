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
$grnFile = 'grn.txt';
$stockFile = 'currentstock.txt';

// Get the input from the request
$input = json_decode(file_get_contents('php://input'), true);
$product = $input['product'];
$gonQuantity = (int)$input['quantity'];

if (!$product || !$gonQuantity) {
    echo json_encode(['success' => false, 'message' => 'Invalid product or quantity']);
    exit();
}

// Load GRN data (for FIFO) and current stock data
$grnLines = file($grnFile, FILE_IGNORE_NEW_LINES);
$currentStockLines = file($stockFile, FILE_IGNORE_NEW_LINES);

// Filter out the relevant product stock from GRN and sort by date (FIFO order)
$grnStock = [];
foreach ($grnLines as $line) {
    list($id, $grnProduct, $grnQty, $grnPrice, $grnTotalValue, $grnDate) = explode(',', $line);
    if ($grnProduct === $product && $grnQty > 0) {
        $grnStock[] = [
            'id' => $id,
            'qty' => (int)$grnQty,
            'price' => (float)$grnPrice,
            'totalValue' => (float)$grnTotalValue,
            'date' => $grnDate
        ];
    }
}

// Check if enough stock is available in current stock
$currentStock = null;
$updatedStockLines = [];
foreach ($currentStockLines as $line) {
    list($id, $stockProduct, $stockQty, $stockTotalValue, $stockLastUpdated) = explode(',', $line);
    
    if ($stockProduct === $product) {
        $currentStock = [
            'id' => $id,
            'qty' => (int)$stockQty,
            'totalValue' => (float)$stockTotalValue,
            'lastUpdated' => $stockLastUpdated
        ];
    } else {
        // Keep other stock lines unchanged
        $updatedStockLines[] = $line;
    }
}

if (!$currentStock || $currentStock['qty'] < $gonQuantity) {
    echo json_encode(['success' => false, 'message' => 'Not enough stock available']);
    exit();
}

// Process the GON using FIFO without modifying the GRN and adjust stock
$remainingQty = $gonQuantity;
$totalCost = 0;
$newGonEntries = [];
$newStockQty = $currentStock['qty'];
$newStockTotalValue = $currentStock['totalValue'];
$timestamp = date('Y-m-d H:i:s');

// Process the FIFO logic
foreach ($grnStock as &$grn) {
    if ($remainingQty > 0) {
        $usedQty = min($remainingQty, $grn['qty']);
        $usedValue = $usedQty * $grn['price'];

        // Deduct from GON quantity and calculate cost
        $remainingQty -= $usedQty;
        $totalCost += $usedValue;

        // Add entry to GON file
        $newGonEntries[] = [
            'id' => count(file($gonFile)) + 1, // GON ID
            'product' => $product,
            'qty' => $usedQty,
            'price' => $grn['price'],
            'totalCost' => $usedValue,
            'date' => $timestamp
        ];

        // Update current stock quantity and total value
        $newStockQty -= $usedQty;
        $newStockTotalValue -= $usedValue;
    }
}

// Save new GON entries to gon.txt
foreach ($newGonEntries as $gonEntry) {
    file_put_contents($gonFile, implode(',', $gonEntry) . PHP_EOL, FILE_APPEND);
}

// Update only the relevant product in currentstock.txt
$updatedStockLines[] = "$currentStock[id],$product,$newStockQty,$newStockTotalValue,$timestamp";

// Overwrite currentstock.txt with updated stock information
file_put_contents($stockFile, implode(PHP_EOL, $updatedStockLines) . PHP_EOL);

// Return success and total cost
echo json_encode(['success' => true, 'totalCost' => $totalCost]);
?>
