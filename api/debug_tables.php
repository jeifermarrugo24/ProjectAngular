<?php
// Script para verificar la estructura de las tablas de la base de datos

require_once 'db_connection.php';

try {
    $conn = get_connection();

    echo "=== VERIFICACIÓN DE ESTRUCTURA DE TABLAS ===\n\n";

    // Verificar tabla menus
    echo "TABLA: menus\n";
    echo "============\n";
    $stmt = $conn->prepare("DESCRIBE menus");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($columns as $column) {
        echo sprintf(
            "%-20s %-15s %-10s %-10s\n",
            $column['Field'],
            $column['Type'],
            $column['Null'],
            $column['Key']
        );
    }

    // Verificar si hay datos en la tabla menus
    echo "\nCONTEO DE REGISTROS:\n";
    $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM menus");
    $countStmt->execute();
    $count = $countStmt->fetch(PDO::FETCH_ASSOC);
    echo "Total menus: " . $count['total'] . "\n";

    // Mostrar algunos registros de ejemplo
    if ($count['total'] > 0) {
        echo "\nREGISTROS DE EJEMPLO:\n";
        $sampleStmt = $conn->prepare("SELECT * FROM menus LIMIT 3");
        $sampleStmt->execute();
        $samples = $sampleStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($samples as $sample) {
            echo "ID: " . $sample['menu_id'] . " - Nombre: " . $sample['menu_nombre'] . " - Tipo: " . $sample['menu_tipo'] . "\n";
        }
    }

    echo "\n" . str_repeat("=", 50) . "\n\n";

    // Verificar tabla permisos
    echo "TABLA: permisos\n";
    echo "===============\n";
    $stmt2 = $conn->prepare("DESCRIBE permisos");
    $stmt2->execute();
    $columns2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    foreach ($columns2 as $column) {
        echo sprintf(
            "%-20s %-15s %-10s %-10s\n",
            $column['Field'],
            $column['Type'],
            $column['Null'],
            $column['Key']
        );
    }

    // Verificar si hay datos en la tabla permisos
    $countStmt2 = $conn->prepare("SELECT COUNT(*) as total FROM permisos");
    $countStmt2->execute();
    $count2 = $countStmt2->fetch(PDO::FETCH_ASSOC);
    echo "\nTotal permisos: " . $count2['total'] . "\n";

    // Mostrar algunos registros de ejemplo
    if ($count2['total'] > 0) {
        echo "\nREGISTROS DE EJEMPLO:\n";
        $sampleStmt2 = $conn->prepare("SELECT * FROM permisos LIMIT 5");
        $sampleStmt2->execute();
        $samples2 = $sampleStmt2->fetchAll(PDO::FETCH_ASSOC);

        foreach ($samples2 as $sample) {
            echo "ID: " . $sample['permiso_id'] . " - Perfil: " . $sample['permiso_perfil'] . " - Menu: " . $sample['permiso_menu'] . "\n";
        }
    }

    echo "\n" . str_repeat("=", 50) . "\n\n";

    // Probar la consulta join
    echo "PRUEBA DE JOIN:\n";
    echo "===============\n";

    $joinStmt = $conn->prepare("
        SELECT DISTINCT 
            m.menu_id,
            m.menu_nombre,
            m.menu_tipo,
            m.menu_id_padre,
            p.permiso_perfil
        FROM menus m
        INNER JOIN permisos p ON p.permiso_menu = m.menu_id
        WHERE p.permiso_perfil = 1
        LIMIT 5
    ");
    $joinStmt->execute();
    $joinResults = $joinStmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Menús para perfil 1:\n";
    foreach ($joinResults as $result) {
        echo "- " . $result['menu_nombre'] . " (ID: " . $result['menu_id'] . ")\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
