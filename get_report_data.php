<?php
// Allow requests from any origin (for CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight (CORS preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type to JSON
header('Content-Type: application/json');

// Function to read all data from a file
function readAllData($filePath, $dateFieldIndex, $isCurrentStock = false) {
    $entries = [];

    if (file_exists($filePath)) {
        $file = fopen($filePath, 'r');
        while (($line = fgets($file)) !== false) {
            $fields = explode(',', trim($line));
            
            // For currentstock.txt, do not include unitPrice
            if ($isCurrentStock) {
                $entries[] = [
                    'id' => $fields[0],
                    'product' => $fields[1],
                    'quantity' => $fields[2],
                    'value' => $fields[3],
                    'date' => $fields[4],
                ];
            } else {
                $entries[] = [
                    'id' => $fields[0],
                    'product' => $fields[1],
                    'quantity' => $fields[2],
                    'unitPrice' => $fields[3],
                    'total' => $fields[4],
                    'date' => isset($fields[$dateFieldIndex]) ? $fields[$dateFieldIndex] : 'N/A'
                ];
            }
        }
        fclose($file);
    } else {
        // Log an error if the file does not exist
        error_log("File not found: " . $filePath);
    }

    return $entries;
}

// Read GRN and GON entries without date filtering
$grnEntries = readAllData('grn.txt', 5); // Assuming date is the 6th column (index 5)
$gonEntries = readAllData('gon.txt', 5); // Assuming date is the 5th column (index 4)

// Read current stock without unitPrice (marked with true for the last argument)
$currentStock = readAllData('currentstock.txt', 4, true); // Assuming date is the 5th column (index 4)

// Return the data as JSON
echo json_encode([
    'success' => true,
    'grnEntries' => $grnEntries,
    'gonEntries' => $gonEntries,
    'currentStock' => $currentStock
]);
?>
