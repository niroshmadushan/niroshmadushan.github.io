<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$userFile = 'user.txt';

// Decode the JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Debugging: Log the input data to the error log
error_log("Received input data: " . print_r($input, true));

// Validate input
if (!isset($input['id']) || !isset($input['email']) || !isset($input['role']) || !isset($input['active'])) {
    error_log("Invalid input data");
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

$id = $input['id'];
$email = $input['email'];
$role = $input['role'];
$active = ($input['active'] === 'active') ? 'active' : 'inactive'; // Properly handle 'active' and 'inactive' values

// Check if the file exists
if (!file_exists($userFile)) {
    error_log("User file not found: " . $userFile);
    echo json_encode(['success' => false, 'message' => 'User file not found']);
    exit;
}

// Read the user file
$users = file($userFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$updatedUsers = [];
$userFound = false;

// Loop through each user, find the matching ID, and update the details
foreach ($users as $user) {
    list($userId, $storedEmail, $storedPassword, $storedRole, $storedActive) = explode(',', $user);
    
    // Debugging: Log the current user being processed
    error_log("Processing user ID: $userId");

    if ($userId == $id) {
        // Update the user with new details
        error_log("User found. Updating user ID: $id");
        $updatedUsers[] = "$userId,$email,$storedPassword,$role,$active"; // Correctly update the status
        $userFound = true;
    } else {
        // Keep the other users as they are
        $updatedUsers[] = $user;
    }
}

// If user found, update the file
if ($userFound) {
    // Write to the file and check for success
    $fileWriteResult = file_put_contents($userFile, implode(PHP_EOL, $updatedUsers) . PHP_EOL);
    if ($fileWriteResult !== false) {
        error_log("File written successfully");
        echo json_encode(['success' => true, 'message' => 'User updated successfully']);
    } else {
        error_log("Failed to write to user file");
        echo json_encode(['success' => false, 'message' => 'Failed to write to user file']);
    }
} else {
    error_log("User ID not found: $id");
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>
