<?php
// Disable error output in the browser and log errors instead
ini_set('display_errors', 0);  // Hide errors from output
ini_set('log_errors', 1);      // Log errors to a file
ini_set('error_log', 'C:/xampp/php/logs/php-error.log');  // Ensure this path is correct

// Send headers to allow CORS and return JSON
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");  // Set correct content type

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$database = "mydb";

// Create a connection
$conn = new mysqli($servername, $username, $password, $database);

// Check the connection
if ($conn->connect_error) {
    http_response_code(500);  // Set the correct response code
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit();  // Stop script execution
}

// Assuming the user email is posted to this script via JSON
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? null;

if ($email) {
    // Prepare the SQL query securely with prepared statements
    $stmt = $conn->prepare("SELECT class FROM user WHERE email = ?");
    
    // Check if the statement was prepared successfully
    if ($stmt === false) {
        http_response_code(500);  // Set the correct response code
        echo json_encode(['error' => 'Failed to prepare the SQL statement']);
        exit();  // Stop script execution
    }
    
    // Bind the parameters and execute the statement
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if user exists and return appropriate response
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(['exists' => true, 'userClass' => $row['class']]);
    } else {
        echo json_encode(['exists' => false]);
    }

    // Close the statement
    $stmt->close();

    // Ensure we stop the script execution here
    exit();
} else {
    http_response_code(400);  // Set the correct response code
    echo json_encode(['error' => 'Email not provided']);
    exit();  // Stop script execution
}

// Close the database connection
$conn->close();
?>
