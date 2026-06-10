<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$conn = new mysqli("sql210.infinityfree.com", "if0_42140168", "12Reuben34", "if0_42140168_care_dental_db");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (isset($data->firstName) && isset($data->lastName) && isset($data->uniqueCode)) {
    $firstName = $conn->real_escape_string($data->firstName);
    $lastName = $conn->real_escape_string($data->lastName);
    $age = $conn->real_escape_string($data->age);
    $sex = $conn->real_escape_string($data->sex);
    $contact = $conn->real_escape_string($data->contact);
    $visitPurpose = $conn->real_escape_string($data->visitPurpose);
    $emergencyContact = $conn->real_escape_string($data->emergencyContact);
    $relationship = $conn->real_escape_string($data->relationship);
    $address = $conn->real_escape_string($data->address);
    $uniqueCode = $conn->real_escape_string($data->uniqueCode);
    $photo = isset($data->photo) ? $conn->real_escape_string($data->photo) : '';
    
    // Safety check if the patient code already exists in the database
    $check = $conn->query("SELECT id FROM patients WHERE unique_code = '$uniqueCode'");
    
    if ($check->num_rows > 0) {
        // Patient exists - Update details and set status to 'Waiting' for a new consultation/review
        $sql = "UPDATE patients SET 
                first_name = '$firstName', 
                last_name = '$lastName', 
                age = '$age', 
                sex = '$sex', 
                contact = '$contact', 
                emergency_contact = '$emergencyContact', 
                relationship = '$relationship', 
                address = '$address', 
                status = 'Waiting' 
                WHERE unique_code = '$uniqueCode'";
    } else {
        // New Patient Registration
        $sql = "INSERT INTO patients (first_name, last_name, age, sex, contact, emergency_contact, relationship, address, unique_code, status, dentist_notes, tooth_data) 
                VALUES ('$firstName', '$lastName', '$age', '$sex', '$contact', '$emergencyContact', '$relationship', '$address', '$uniqueCode', 'Waiting', '{}', '{}')";
    }

    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Patient successfully queued."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data transmission."]);
}

$conn->close();
?>