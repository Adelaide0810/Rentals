<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$conn = new mysqli("sql210.infinityfree.com", "if0_42140168", "12Reuben34", "if0_42140168_care_dental_db");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

if (isset($_GET['q'])) {
    $q = $conn->real_escape_string($_GET['q']);
    // Search by name or code to pull their old file
    $sql = "SELECT * FROM patients WHERE first_name LIKE '%$q%' OR last_name LIKE '%$q%' OR unique_code LIKE '%$q%' LIMIT 10";
    $result = $conn->query($sql);
    
    $patients = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $patients[] = $row;
        }
    }
    echo json_encode($patients);
} else {
    echo json_encode([]);
}

$conn->close();
?>