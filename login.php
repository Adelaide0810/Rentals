<?php
// 1. Allow React to communicate with PHP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 2. Database Connection Variables 
$host = "sql210.infinityfree.com";
$db_user = "if0_42140168";
$db_pass = "12Reuben34";
$db_name = "if0_42140168_care_dental_db"; 

$conn = new mysqli($host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// 3. Decode the JSON sent by React's fetch() command
$data = json_decode(file_get_contents("php://input"));

if(isset($data->username) && isset($data->password)) {
    $username = $data->username;
    $password = $data->password;

    // 4. Query the database
    // UPDATE 'users' TO MATCH YOUR ACTUAL TABLE NAME
    $stmt = $conn->prepare("SELECT username, password, role FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // NOTE: If your passwords are encrypted with password_hash(), change the below line to:
        // if (password_verify($password, $row['password'])) {
            
        if ($password === $row['password']) { 
            // Send success payload to React App.jsx
            echo json_encode([
                "success" => true,
                "username" => $row['username'],
                "role" => $row['role'] 
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid username or password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid username or password"]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Missing credentials"]);
}

$conn->close();
?>