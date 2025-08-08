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

try {
    $conn = get_connection();

    // Obtener el perfil desde el query parameter
    $perfil_id = intval($_GET['perfil'] ?? 1);

    echo "=== PRUEBA DE CONSULTA DE MENÚS POR PERFIL ===\n";
    echo "Perfil ID: $perfil_id\n\n";

    // Ejecutar la misma consulta que usa el backend
    $sql = "SELECT DISTINCT m.menu_id, m.menu_nombre, m.menu_tipo, m.menu_path, 
                   m.menu_id_padre, m.menu_orden, m.menu_estado 
            FROM menus m 
            INNER JOIN permisos p ON m.menu_id = p.permiso_menu 
            WHERE p.permiso_perfil = :perfil_id 
            AND m.menu_estado = 'Activo'
            ORDER BY m.menu_orden ASC, m.menu_nombre ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':perfil_id', $perfil_id);
    $stmt->execute();

    $menus = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Menús encontrados: " . count($menus) . "\n\n";

    if (count($menus) > 0) {
        echo "RESULTADO:\n";
        echo json_encode($menus, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        echo "NO SE ENCONTRARON MENÚS PARA ESTE PERFIL\n\n";

        // Verificar si existen permisos
        $check_sql = "SELECT COUNT(*) as total FROM permisos WHERE permiso_perfil = :perfil_id";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bindParam(':perfil_id', $perfil_id);
        $check_stmt->execute();
        $permiso_count = $check_stmt->fetch(PDO::FETCH_ASSOC);

        echo "Permisos en la tabla para este perfil: " . $permiso_count['total'] . "\n";

        // Verificar si existen menús
        $menu_sql = "SELECT COUNT(*) as total FROM menus WHERE menu_estado = 'Activo'";
        $menu_stmt = $conn->prepare($menu_sql);
        $menu_stmt->execute();
        $menu_count = $menu_stmt->fetch(PDO::FETCH_ASSOC);

        echo "Menús activos en la tabla: " . $menu_count['total'] . "\n";
    }
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
