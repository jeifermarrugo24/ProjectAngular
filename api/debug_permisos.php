<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db_connection.php';
$conn = get_connection();

try {
    echo json_encode([
        'message' => 'Script de debug para verificar permisos y menús',
        'timestamp' => date('Y-m-d H:i:s')
    ]);

    // Verificar estructura de tablas
    echo "\n\n=== ESTRUCTURA DE TABLA PERMISOS ===\n";
    $stmt = $conn->prepare("DESCRIBE permisos");
    $stmt->execute();
    $permisos_structure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($permisos_structure, JSON_PRETTY_PRINT);

    echo "\n\n=== ESTRUCTURA DE TABLA MENUS ===\n";
    $stmt = $conn->prepare("DESCRIBE menus");
    $stmt->execute();
    $menus_structure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($menus_structure, JSON_PRETTY_PRINT);

    // Verificar datos existentes
    echo "\n\n=== DATOS EN TABLA PERMISOS ===\n";
    $stmt = $conn->prepare("SELECT * FROM permisos LIMIT 10");
    $stmt->execute();
    $permisos_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($permisos_data, JSON_PRETTY_PRINT);

    echo "\n\n=== DATOS EN TABLA MENUS ===\n";
    $stmt = $conn->prepare("SELECT * FROM menus LIMIT 10");
    $stmt->execute();
    $menus_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($menus_data, JSON_PRETTY_PRINT);

    // Verificar relación entre permisos y menús
    echo "\n\n=== CONSULTA JOIN PERMISOS-MENUS ===\n";
    $stmt = $conn->prepare("
        SELECT p.permiso_id, p.permiso_perfil, p.permiso_menu, 
               m.menu_id, m.menu_nombre, m.menu_tipo, m.menu_path, m.menu_estado
        FROM permisos p 
        LEFT JOIN menus m ON p.permiso_menu = m.menu_id 
        LIMIT 10
    ");
    $stmt->execute();
    $join_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($join_data, JSON_PRETTY_PRINT);

    // Contar permisos por perfil
    echo "\n\n=== CONTEO DE PERMISOS POR PERFIL ===\n";
    $stmt = $conn->prepare("
        SELECT permiso_perfil, COUNT(*) as total_permisos 
        FROM permisos 
        GROUP BY permiso_perfil
    ");
    $stmt->execute();
    $count_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($count_data, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en debug', 'detalle' => $e->getMessage()]);
}
