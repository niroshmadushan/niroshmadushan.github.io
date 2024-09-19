<?php
// Enable CORS for cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fetch input data from the request
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'];
$currentPassword = $input['currentPassword'];
$newPassword = $input['newPassword'];

// Path to the user.txt file
$userFile = 'user.txt';

// Check if the user.txt file exists
if (!file_exists($userFile)) {
    echo json_encode(['success' => false, 'message' => 'User file not found']);
    exit();
}

// Read all users from the file
$users = file($userFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$userFound = false;

foreach ($users as &$user) {
    list($id, $storedEmail, $storedPassword, $role) = explode(',', $user);

    // Check if the email matches
    if ($storedEmail === $email) {
        // Validate current password
        if ($storedPassword === $currentPassword) {
            // Update password
            $user = "$id,$storedEmail,$newPassword,$role";
            $userFound = true;
            break;
        } else {
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            exit();
        }
    }
}

// If the user is found and updated, save the file
if ($userFound) {
    file_put_contents($userFile, implode("\n", $users));
    echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

?>
