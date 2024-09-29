<?php
// Allow CORS (Cross-Origin Resource Sharing)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Database credentials
$servername = "sql6.webzdarma.cz";
$username = "databasepokl4563";
$password = "databasepokl4563";
$dbname = "Databasepokladna.1";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(array("error" => "Database connection failed")));
}

// Check if class parameter is passed
if (isset($_GET['class'])) {
    $class = $_GET['class'];

    // Prepare SQL query to fetch widgets based on class
    $sql = "SELECT * FROM widgets WHERE class = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $class);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if any widgets were found
    if ($result->num_rows > 0) {
        $widgets = array();
        while ($row = $result->fetch_assoc()) {
            $widgets[] = $row;
        }
        // Send widgets data as JSON response
        echo json_encode(array("widgets" => $widgets));
    } else {
        // No widgets found for the given class
        echo json_encode(array("error" => "No widgets found for class: $class"));
    }
} else {
    echo json_encode(array("error" => "Class parameter missing"));
}

// Close connection
$conn->close();
?>
