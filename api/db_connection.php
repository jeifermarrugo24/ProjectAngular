<?php
function get_connection() {
    $db_host = 'localhost';
    $db_user = 'root';
    $db_pass = '';
    $db_name = 'prueba_tecnica_db_skinatech';
    $charset = 'utf8mb4';

    try {
        $dsn = "mysql:host=$db_host;dbname=$db_name;charset=$charset";
        $conn = new PDO($dsn, $db_user, $db_pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al conectar con la base de datos']) . $e->getMessage();
        exit;
    }
}
