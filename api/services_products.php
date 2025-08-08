<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db_connection.php';
$conn = get_connection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metodo no permitido']);
    exit;
}

$headers = getallheaders();
$jwt = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (empty($jwt)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token no proporcionado']);
    exit;
}

if (stripos($jwt, 'Bearer ') === 0) {
    $jwt = trim(substr($jwt, 7));
}


$data = json_decode(file_get_contents("php://input"), true);
$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'guardar':
        save_products($data, $conn);
        break;
    case 'consultar':
        get_products($data, $conn);
        break;
    case 'eliminar':
        delete_products($data, $conn);
        break;
    case 'editar':
        update_products($data, $conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Accion no valida']);
        break;
}

function save_products($data, $conn)
{
    $producto_nombre = $data['producto_nombre'] ?? '';
    $producto_categoria = intval($data['producto_categoria'] ?? 0);
    $subcategorias_seleccionadas = $data['subcategorias_seleccionadas'] ?? [];

    if (!$producto_nombre || $producto_categoria <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'El nombre del producto y la categoría son obligatorios']);
        return;
    }

    try {
        // Comenzar transacción
        $conn->beginTransaction();

        // Verificar que la categoría existe
        $stmt = $conn->prepare("SELECT categoria_id FROM categorias WHERE categoria_id = :categoria_id");
        $stmt->bindParam(':categoria_id', $producto_categoria);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode(['error' => 'La categoría seleccionada no existe']);
            return;
        }

        // Verificar que las subcategorías existen y pertenecen a la categoría
        if (!empty($subcategorias_seleccionadas)) {
            $placeholders = str_repeat('?,', count($subcategorias_seleccionadas) - 1) . '?';
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM subcategorias WHERE subcategoria_id IN ($placeholders) AND subcategoria_categoria = ?");
            $params = array_merge($subcategorias_seleccionadas, [$producto_categoria]);
            $stmt->execute($params);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result['count'] != count($subcategorias_seleccionadas)) {
                $conn->rollBack();
                http_response_code(400);
                echo json_encode(['error' => 'Algunas subcategorías seleccionadas no existen o no pertenecen a la categoría']);
                return;
            }
        }

        // Insertar el producto (solo con categoría principal)
        $stmt = $conn->prepare("INSERT INTO productos (producto_nombre, producto_categoria) VALUES (:producto_nombre, :producto_categoria)");
        $stmt->bindParam(':producto_nombre', $producto_nombre);
        $stmt->bindParam(':producto_categoria', $producto_categoria);
        $stmt->execute();

        $producto_id = $conn->lastInsertId();

        // Insertar las relaciones con subcategorías en la tabla categorias_productos
        if (!empty($subcategorias_seleccionadas)) {
            foreach ($subcategorias_seleccionadas as $subcategoria_id) {
                $stmt = $conn->prepare("INSERT INTO categorias_productos (categorias_productos_id_producto, categorias_productos_id_categoria) VALUES (:producto_id, :subcategoria_id)");
                $stmt->bindParam(':producto_id', $producto_id);
                $stmt->bindParam(':subcategoria_id', $subcategoria_id);
                $stmt->execute();
            }
        }

        // Confirmar transacción
        $conn->commit();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Producto guardado correctamente', 'id_registro' => $producto_id]);
    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar el producto', 'detalle' => $e->getMessage()]);
    }
}

function get_products($data, $conn)
{
    $conditions = "WHERE 1=1";
    $params = [];

    if (!empty($data['producto_nombre'])) {
        $conditions .= " AND p.producto_nombre LIKE :producto_nombre";
        $params[':producto_nombre'] = "%" . $data['producto_nombre'] . "%";
    }

    if (!empty($data['producto_id'])) {
        $conditions .= " AND p.producto_id = :producto_id";
        $params[':producto_id'] = intval($data['producto_id']);
    }

    if (!empty($data['producto_categoria'])) {
        $conditions .= " AND p.producto_categoria = :producto_categoria";
        $params[':producto_categoria'] = intval($data['producto_categoria']);
    }

    try {
        // Consulta para obtener productos con sus subcategorías
        $sql = "SELECT 
                    p.producto_id,
                    p.producto_nombre,
                    p.producto_categoria,
                    c.categoria_nombre,
                    GROUP_CONCAT(s.subcategoria_id) as subcategorias_ids,
                    GROUP_CONCAT(s.subcategoria_nombre SEPARATOR ', ') as subcategorias_nombres
                FROM productos p
                LEFT JOIN categorias c ON p.producto_categoria = c.categoria_id
                LEFT JOIN categorias_productos cp ON p.producto_id = cp.categorias_productos_id_producto
                LEFT JOIN subcategorias s ON cp.categorias_productos_id_categoria = s.subcategoria_id
                $conditions
                GROUP BY p.producto_id, p.producto_nombre, p.producto_categoria, c.categoria_nombre
                ORDER BY p.producto_nombre";

        $stmt = $conn->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Procesar los resultados para convertir las subcategorías en arrays
        foreach ($datos as &$producto) {
            if ($producto['subcategorias_ids']) {
                $producto['subcategorias_ids'] = explode(',', $producto['subcategorias_ids']);
                $producto['subcategorias_ids'] = array_map('intval', $producto['subcategorias_ids']);
            } else {
                $producto['subcategorias_ids'] = [];
            }

            if (!$producto['subcategorias_nombres']) {
                $producto['subcategorias_nombres'] = 'Sin subcategorías';
            }
        }

        if (!$datos) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontraron productos registrados']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $datos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar los productos', 'detalle' => $e->getMessage()]);
    }
}

function delete_products($data, $conn)
{
    $producto_id = intval($data['producto_id'] ?? 0);
    if ($producto_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Id de producto no valido']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM productos WHERE producto_id = :producto_id");
        $stmt->bindParam(':producto_id', $producto_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Producto eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar el producto', 'detalle' => $e->getMessage()]);
    }
}

function update_products($data, $conn)
{
    $producto_id = intval($data['producto_id'] ?? 0);
    $producto_nombre = $data['producto_nombre'] ?? '';
    $producto_categoria = intval($data['producto_categoria'] ?? 0);
    $subcategorias_seleccionadas = $data['subcategorias_seleccionadas'] ?? [];

    if ($producto_id <= 0 || !$producto_nombre || $producto_categoria <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'El ID del producto, nombre y categoría son obligatorios']);
        return;
    }

    try {
        // Comenzar transacción
        $conn->beginTransaction();

        // Verificar que el producto existe
        $stmt = $conn->prepare("SELECT producto_id FROM productos WHERE producto_id = :producto_id");
        $stmt->bindParam(':producto_id', $producto_id);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            $conn->rollBack();
            http_response_code(404);
            echo json_encode(['error' => 'El producto no existe']);
            return;
        }

        // Verificar que la categoría existe
        $stmt = $conn->prepare("SELECT categoria_id FROM categorias WHERE categoria_id = :categoria_id");
        $stmt->bindParam(':categoria_id', $producto_categoria);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode(['error' => 'La categoría seleccionada no existe']);
            return;
        }

        // Verificar que las subcategorías existen y pertenecen a la categoría
        if (!empty($subcategorias_seleccionadas)) {
            $placeholders = str_repeat('?,', count($subcategorias_seleccionadas) - 1) . '?';
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM subcategorias WHERE subcategoria_id IN ($placeholders) AND subcategoria_categoria = ?");
            $params = array_merge($subcategorias_seleccionadas, [$producto_categoria]);
            $stmt->execute($params);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result['count'] != count($subcategorias_seleccionadas)) {
                $conn->rollBack();
                http_response_code(400);
                echo json_encode(['error' => 'Algunas subcategorías seleccionadas no existen o no pertenecen a la categoría']);
                return;
            }
        }

        // Actualizar el producto
        $stmt = $conn->prepare("UPDATE productos SET producto_nombre = :producto_nombre, producto_categoria = :producto_categoria WHERE producto_id = :producto_id");
        $stmt->bindParam(':producto_nombre', $producto_nombre);
        $stmt->bindParam(':producto_categoria', $producto_categoria);
        $stmt->bindParam(':producto_id', $producto_id);
        $stmt->execute();

        // Eliminar relaciones existentes
        $stmt = $conn->prepare("DELETE FROM categorias_productos WHERE categorias_productos_id_producto = :producto_id");
        $stmt->bindParam(':producto_id', $producto_id);
        $stmt->execute();

        // Insertar nuevas relaciones con subcategorías
        if (!empty($subcategorias_seleccionadas)) {
            foreach ($subcategorias_seleccionadas as $subcategoria_id) {
                $stmt = $conn->prepare("INSERT INTO categorias_productos (categorias_productos_id_producto, categorias_productos_id_categoria) VALUES (:producto_id, :subcategoria_id)");
                $stmt->bindParam(':producto_id', $producto_id);
                $stmt->bindParam(':subcategoria_id', $subcategoria_id);
                $stmt->execute();
            }
        }

        // Confirmar transacción
        $conn->commit();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Producto actualizado correctamente']);
    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar el producto', 'detalle' => $e->getMessage()]);
    }
}

function validar_token($jwt, $clave)
{
    $partes = explode('.', $jwt);
    if (count($partes) !== 3) return false;

    list($header, $payload, $firma) = $partes;

    $valida = hash_hmac('sha256', "$header.$payload", $clave, true);
    $valida_b64 = rtrim(strtr(base64_encode($valida), '+/', '-_'), '=');

    return hash_equals($firma, $valida_b64);
}
