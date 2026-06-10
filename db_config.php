<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

$host = "sql210.infinityfree.com";
$user = "if0_42140168";
$pass = "12Reuben34";
$dbname = "if0_42140168_care_dental_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed"]));
}

// Handle pre-flight OPTIONS request for Axios
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}
?>