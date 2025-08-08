<?php
header("Content-Type: application/json; charset=utf-8");

// Incluir la conexión
require_once 'db_connection.php';
$conn = get_connection();

echo "<h2>Test de API de Productos con Categorías y Subcategorías</h2>\n";

// 1. Consultar categorías disponibles
echo "<h3>1. Categorías disponibles:</h3>\n";
try {
    $stmt = $conn->prepare("SELECT categoria_id, categoria_nombre FROM categorias ORDER BY categoria_nombre");
    $stmt->execute();
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<pre>";
    print_r($categorias);
    echo "</pre>";

    if (count($categorias) > 0) {
        $categoria_test = $categorias[0]['categoria_id'];
        echo "<p>Usaremos categoría ID: $categoria_test</p>\n";

        // 2. Consultar subcategorías de esa categoría
        echo "<h3>2. Subcategorías de la categoría $categoria_test:</h3>\n";
        $stmt = $conn->prepare("SELECT subcategoria_id, subcategoria_nombre FROM subcategorias WHERE subcategoria_categoria = :categoria_id ORDER BY subcategoria_nombre");
        $stmt->bindParam(':categoria_id', $categoria_test);
        $stmt->execute();
        $subcategorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "<pre>";
        print_r($subcategorias);
        echo "</pre>";

        // 3. Crear un producto de prueba
        echo "<h3>3. Insertando producto de prueba:</h3>\n";
        $subcategoria_test = count($subcategorias) > 0 ? $subcategorias[0]['subcategoria_id'] : null;

        $stmt = $conn->prepare("INSERT INTO productos (producto_nombre, producto_categoria, producto_subcaegoria) VALUES (:nombre, :categoria, :subcategoria)");
        $stmt->bindValue(':nombre', 'Producto Test API - ' . date('Y-m-d H:i:s'));
        $stmt->bindValue(':categoria', $categoria_test);
        $stmt->bindValue(':subcategoria', $subcategoria_test);
        $stmt->execute();

        $producto_id = $conn->lastInsertId();
        echo "<p>Producto creado con ID: $producto_id</p>\n";

        // 4. Consultar productos con JOIN
        echo "<h3>4. Productos con información de categorías y subcategorías:</h3>\n";
        $stmt = $conn->prepare("
            SELECT 
                p.producto_id,
                p.producto_nombre,
                p.producto_categoria,
                p.producto_subcaegoria,
                c.categoria_nombre,
                s.subcategoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.producto_categoria = c.categoria_id
            LEFT JOIN subcategorias s ON p.producto_subcaegoria = s.subcategoria_id
            ORDER BY p.producto_id DESC
            LIMIT 5
        ");
        $stmt->execute();
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "<pre>";
        print_r($productos);
        echo "</pre>";

        echo "<p><strong>✅ API de productos funcionando correctamente con relaciones!</strong></p>\n";
    } else {
        echo "<p><strong>❌ No hay categorías registradas. Registre al menos una categoría primero.</strong></p>\n";
    }
} catch (PDOException $e) {
    echo "<p><strong>❌ Error:</strong> " . $e->getMessage() . "</p>\n";
}
