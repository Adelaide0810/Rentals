<?php
// 1. Allow React to communicate with this PHP script (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests from the browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 2. Connect to the database
$conn = new mysqli("sql210.infinityfree.com", "if0_42140168", "12Reuben34", "if0_42140168_care_dental_db");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// 3. Receive the JSON data from React
$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input, true);

if (!empty($data)) {
    // 4. Clean the data and map React's camelCase to MySQL's snake_case
    $first_name        = $conn->real_escape_string($data['firstName'] ?? '');
    $last_name         = $conn->real_escape_string($data['lastName'] ?? '');
    $age               = intval($data['age'] ?? 0);
    $sex               = $conn->real_escape_string($data['sex'] ?? '');
    $contact           = $conn->real_escape_string($data['contact'] ?? '');
    $emergency_contact = $conn->real_escape_string($data['emergencyContact'] ?? '');
    $relationship      = $conn->real_escape_string($data['relationship'] ?? '');
    $address           = $conn->real_escape_string($data['address'] ?? '');
    $unique_code       = $conn->real_escape_string($data['uniqueCode'] ?? '');
    $passport_photo    = $conn->real_escape_string($data['photo'] ?? ''); 
    $status            = "Waiting"; // Default status for the queue

    // 5. Insert into the database
    $query = "INSERT INTO patients (first_name, last_name, age, sex, contact, emergency_contact, relationship, address, unique_code, passport_photo, status) 
              VALUES ('$first_name', '$last_name', $age, '$sex', '$contact', '$emergency_contact', '$relationship', '$address', '$unique_code', '$passport_photo', '$status')";

    if ($conn->query($query)) {
        echo json_encode(["success" => true, "message" => "Patient successfully added to queue"]);
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "MySQL Error: " . $conn->error]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No data received from frontend."]);
}

$conn->close();
?>