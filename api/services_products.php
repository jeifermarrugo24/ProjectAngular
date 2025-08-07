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

    if (!$producto_nombre) {
        http_response_code(400);
        echo json_encode(['error' => 'Todos los campos son obligatorios']);
        return;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO productos (producto_nombre) VALUES (:producto_nombre)");
        $stmt->bindParam(':producto_nombre', $producto_nombre);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Producto guardado correctamente', 'id_registro' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar el producto', 'detalle' => $e->getMessage()]);
    }
}

function get_products($data, $conn)
{
    $conditions = "WHERE 1=1";
    $params = [];

    if (!empty($data['producto_nombre'])) {
        $conditions .= " AND producto_nombre LIKE :producto_nombre";
        $params[':producto_nombre'] = "%" . $data['producto_nombre'] . "%";
    }

    if (!empty($data['producto_id'])) {
        $conditions .= " AND producto_id = :producto_id";
        $params[':producto_id'] = intval($data['producto_id']);
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM productos $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

    if ($producto_id <= 0 || !$producto_nombre) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos invalidos']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE productos SET producto_nombre = :producto_nombre WHERE producto_id = :producto_id");
        $stmt->bindParam(':producto_nombre', $producto_nombre);
        $stmt->bindParam(':producto_id', $producto_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Producto actualizado correctamente']);
    } catch (PDOException $e) {
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
