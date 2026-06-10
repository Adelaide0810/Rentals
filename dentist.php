<?php
// 1. Allow React to communicate with this PHP script (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 2. Connect to the database
$conn = new mysqli("sql210.infinityfree.com", "if0_42140168", "12Reuben34", "if0_42140168_care_dental_db");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw_input = file_get_contents("php://input");
    $data = json_decode($raw_input, true);

    if (isset($data['unique_code'])) {
        $code = $conn->real_escape_string($data['unique_code']);
        $notes = $conn->real_escape_string($data['dentist_notes'] ?? '');
        $new_status = $conn->real_escape_string($data['status'] ?? 'Seen');
        
        // CRITICAL UPDATE LINE: Intercept the incoming JSON Odontogram map string cleanly
        $tooth_data = $conn->real_escape_string($data['tooth_data'] ?? '{}');

        // Include tooth_data inside your UPDATE statement execution:
        $update_query = "UPDATE patients SET dentist_notes = '$notes', tooth_data = '$tooth_data', status = '$new_status' WHERE unique_code = '$code'";
        
        if ($conn->query($update_query)) {
            echo json_encode(["success" => true, "message" => "Clinical records saved successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Failed to update record: " . $conn->error]);
        }
        $conn->close();
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if the frontend specifically asked for the historical archive
    if (isset($_GET['archive']) && $_GET['archive'] === 'true') {
        $sql = "SELECT id, first_name, last_name, unique_code, sex, age, contact, dentist_notes, tooth_data, created_at 
                FROM patients 
                WHERE status = 'Seen' 
                ORDER BY created_at DESC";
    } else {
        // Your default logic for the active waiting room feed
        $sql = "SELECT id, first_name, last_name, unique_code, sex, age, contact, dentist_notes, tooth_data 
                FROM patients 
                WHERE status = 'Waiting' 
                ORDER BY id ASC";
    }

    $result = $conn->query($sql);
    $patients = [];

    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $patients[] = $row;
        }
    }

    echo json_encode($patients);
    $conn->close();
    exit;
}

// 4. Handle default GET requests (Loading the Waiting Room Queue)
$query = "SELECT * FROM patients WHERE status = 'Waiting' OR status = 'In Chair' ORDER BY id ASC";
$result = $conn->query($query);
$patients = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $patients[] = $row;
    }
}

// Return the queue array to React
echo json_encode($patients);
$conn->close();
?>