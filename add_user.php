<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$userFile = 'user.txt';

// Decode the JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['name']) || !isset($input['email']) || !isset($input['role'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

$name = $input['name'];
$email = $input['email'];
$role = $input['role'];

// Check if email already exists
$users = file($userFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($users as $user) {
    list(, $storedEmail) = explode(',', $user);
    if ($storedEmail === $email) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
}

// Generate a new ID
$newId = count($users) + 1;
$newUser = "$newId,$email,password,$role,active";

// Add new user to the file
file_put_contents($userFile, $newUser . PHP_EOL, FILE_APPEND);
echo json_encode(['success' => true, 'message' => 'User added successfully']);
?>
