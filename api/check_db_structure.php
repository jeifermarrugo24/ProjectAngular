<?php
header("Content-Type: text/html; charset=utf-8");

require_once 'db_connection.php';
$conn = get_connection();

echo "<h2>Verificación de estructura de base de datos</h2>\n";

// Verificar estructura de tabla productos
echo "<h3>Estructura de tabla productos:</h3>\n";
try {
    $stmt = $conn->prepare("DESCRIBE productos");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>" . $column['Field'] . "</td>";
        echo "<td>" . $column['Type'] . "</td>";
        echo "<td>" . $column['Null'] . "</td>";
        echo "<td>" . $column['Key'] . "</td>";
        echo "<td>" . $column['Default'] . "</td>";
        echo "<td>" . $column['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Verificar si existen datos
echo "<h3>Conteo de registros:</h3>\n";
try {
    $stmt = $conn->prepare("SELECT COUNT(*) as total_productos FROM productos");
    $stmt->execute();
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Productos: " . $count['total_productos'] . "</p>\n";

    $stmt = $conn->prepare("SELECT COUNT(*) as total_categorias FROM categorias");
    $stmt->execute();
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Categorías: " . $count['total_categorias'] . "</p>\n";

    $stmt = $conn->prepare("SELECT COUNT(*) as total_subcategorias FROM subcategorias");
    $stmt->execute();
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Subcategorías: " . $count['total_subcategorias'] . "</p>\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
