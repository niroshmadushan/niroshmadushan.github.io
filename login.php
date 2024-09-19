<?php
session_start(); // Start a session

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

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = isset($data['email']) ? $data['email'] : null;
$password = isset($data['password']) ? $data['password'] : null;

// Validate credentials by reading the user.txt file
function validateUser($email, $password) {
    $filePath = 'user.txt'; // Path to the user.txt file

    if (file_exists($filePath)) {
        $file = fopen($filePath, 'r');

        while (($line = fgets($file)) !== false) {
            $fields = explode(',', trim($line));

            if (count($fields) === 5) {
                list($userId, $userEmail, $userPassword, $role, $status) = $fields;

                // Check if the provided email and password match
                if ($userEmail === $email && $userPassword === $password) {
                    return [
                        'userId' => $userId,
                        'email' => $userEmail,
                        'role' => $role,
                        'status' => trim($status)
                    ];
                }
            }
        }

        fclose($file);
    }

    return false;
}

$userData = validateUser($email, $password);

if ($userData) {
    // Check if the user is active
    if ($userData['status'] !== 'active') {
        echo json_encode([
            'success' => false,
            'message' => 'Account is inactive. Please contact the administrator.'
        ]);
        exit();
    }

    // Store user data in session
    $_SESSION['user'] = $userData;

    echo json_encode([
        'success' => true,
        'user' => $userData
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password'
    ]);
}
?>
