<?php
header("Content-Type: text/html; charset=utf-8");

require_once 'db_connection.php';
$conn = get_connection();

echo "<h2>Test de Consultas de Categorías y Subcategorías para Productos</h2>\n";

echo "<h3>1. Consultar todas las categorías activas:</h3>\n";
try {
    $stmt = $conn->prepare("SELECT * FROM categorias WHERE categoria_estado IN ('activo', 'A') ORDER BY categoria_nombre");
    $stmt->execute();
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<table border='1' style='border-collapse: collapse; margin-bottom: 20px;'>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Estado</th></tr>";
    foreach ($categorias as $cat) {
        echo "<tr>";
        echo "<td>" . $cat['categoria_id'] . "</td>";
        echo "<td>" . $cat['categoria_nombre'] . "</td>";
        echo "<td>" . $cat['categoria_estado'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";

    if (count($categorias) > 0) {
        $categoria_test = $categorias[0]['categoria_id'];
        echo "<h3>2. Consultar subcategorías de la categoría ID $categoria_test:</h3>\n";

        $stmt = $conn->prepare("SELECT * FROM subcategorias WHERE subcategoria_categoria = :categoria_id AND subcategoria_estado IN ('activo', 'A') ORDER BY subcategoria_nombre");
        $stmt->bindParam(':categoria_id', $categoria_test);
        $stmt->execute();
        $subcategorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "<table border='1' style='border-collapse: collapse; margin-bottom: 20px;'>";
        echo "<tr><th>ID</th><th>Nombre</th><th>Categoría ID</th><th>Estado</th></tr>";
        foreach ($subcategorias as $sub) {
            echo "<tr>";
            echo "<td>" . $sub['subcategoria_id'] . "</td>";
            echo "<td>" . $sub['subcategoria_nombre'] . "</td>";
            echo "<td>" . $sub['subcategoria_categoria'] . "</td>";
            echo "<td>" . $sub['subcategoria_estado'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";

        echo "<h3>3. Simulación de consulta de subcategorías desde el frontend:</h3>\n";
        echo "<p><strong>Datos enviados:</strong> { subcategoria_categoria: $categoria_test }</p>\n";

        // Simular la consulta que haría el frontend
        $data = ['subcategoria_categoria' => $categoria_test];
        $conditions = "WHERE 1=1";
        $params = [];

        if (!empty($data['subcategoria_categoria'])) {
            $conditions .= " AND subcategoria_categoria = :subcategoria_categoria";
            $params[':subcategoria_categoria'] = $data['subcategoria_categoria'];
        }

        $stmt = $conn->prepare("SELECT * FROM subcategorias $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "<p><strong>Respuesta simulada de la API:</strong></p>";
        echo "<pre>";
        echo json_encode(['success' => true, 'data' => $result], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        echo "</pre>";

        echo "<p><strong>✅ Las consultas funcionan correctamente. El frontend debería recibir las subcategorías filtradas por categoría.</strong></p>\n";
    } else {
        echo "<p><strong>❌ No hay categorías activas. Agregue al menos una categoría activa.</strong></p>\n";
    }
} catch (PDOException $e) {
    echo "<p><strong>❌ Error:</strong> " . $e->getMessage() . "</p>\n";
}
