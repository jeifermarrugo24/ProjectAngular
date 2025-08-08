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

// Validar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metodo no permitido']);
    exit;
}

// Validar token
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

/*
// Descomenta esta validación si ya tienes tu $token_secreto
if (!validar_token($jwt, $token_secreto)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido']);
    exit;
}
*/

$data = json_decode(file_get_contents("php://input"), true);
$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'guardar':
        save_subcategories($data, $conn);
        break;
    case 'consultar':
        get_subcategories($data, $conn);
        break;
    case 'eliminar':
        delete_subcategories($data, $conn);
        break;
    case 'editar':
        update_subcategories($data, $conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Accion no valida']);
        break;
}

// -----------------------------
// FUNCIONES
// -----------------------------

function save_subcategories($data, $conn)
{
    $subcategoria_nombre = $data['subcategoria_nombre'] ?? '';
    $subcategoria_cantidad_productos = $data['subcategoria_cantidad_productos'] ?? 0;
    $subcategoria_estado = $data['subcategoria_estado'] ?? '';
    $subcategoria_categoria = $data['subcategoria_categoria'] ?? null;

    if (!$subcategoria_nombre || !$subcategoria_estado || !$subcategoria_categoria) {
        http_response_code(400);
        echo json_encode(['error' => 'Todos los campos son obligatorios']);
        return;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO subcategorias (subcategoria_nombre, subcategoria_cantidad_productos, subcategoria_estado, subcategoria_categoria) 
            VALUES (:subcategoria_nombre, :subcategoria_cantidad_productos, :subcategoria_estado, :subcategoria_categoria)");

        $stmt->bindParam(':subcategoria_nombre', $subcategoria_nombre);
        $stmt->bindParam(':subcategoria_cantidad_productos', $subcategoria_cantidad_productos);
        $stmt->bindParam(':subcategoria_estado', $subcategoria_estado);
        $stmt->bindParam(':subcategoria_categoria', $subcategoria_categoria);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Subcategoria guardada correctamente', 'id_registro' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar subcategoria', 'detalle' => $e->getMessage()]);
    }
}

function get_subcategories($data, $conn)
{
    $conditions = "WHERE 1=1";
    $params = [];

    if (!empty($data['subcategoria_nombre'])) {
        $conditions .= " AND subcategoria_nombre LIKE :subcategoria_nombre";
        $params[':subcategoria_nombre'] = "%" . $data['subcategoria_nombre'] . "%";
    }

    if (!empty($data['subcategoria_estado'])) {
        $conditions .= " AND subcategoria_estado = :subcategoria_estado";
        $params[':subcategoria_estado'] = $data['subcategoria_estado'];
    }

    if (!empty($data['subcategoria_categoria'])) {
        $conditions .= " AND subcategoria_categoria = :subcategoria_categoria";
        $params[':subcategoria_categoria'] = $data['subcategoria_categoria'];
    }

    if (!empty($data['subcategoria_id'])) {
        $conditions .= " AND subcategoria_id = :subcategoria_id";
        $params[':subcategoria_id'] = intval($data['subcategoria_id']);
    }

    if (!empty($data['subcategoria_cantidad_productos'])) {
        $conditions .= " AND subcategoria_cantidad_productos = :subcategoria_cantidad_productos";
        $params[':subcategoria_cantidad_productos'] = intval($data['subcategoria_cantidad_productos']);
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM subcategorias $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$datos) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontraron subcategorias']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $datos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar subcategorias', 'detalle' => $e->getMessage()]);
    }
}

function delete_subcategories($data, $conn)
{
    $subcategoria_id = intval($data['subcategoria_id'] ?? 0);
    if ($subcategoria_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Id de subcategoria no valido']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM subcategorias WHERE subcategoria_id = :subcategoria_id");
        $stmt->bindParam(':subcategoria_id', $subcategoria_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Subcategoria eliminada correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar subcategoría', 'detalle' => $e->getMessage()]);
    }
}

function update_subcategories($data, $conn)
{
    $subcategoria_id = intval($data['subcategoria_id'] ?? 0);
    $subcategoria_nombre = $data['subcategoria_nombre'] ?? '';
    $subcategoria_cantidad_productos = $data['subcategoria_cantidad_productos'] ?? 0;
    $subcategoria_estado = $data['subcategoria_estado'] ?? '';
    $subcategoria_categoria = $data['subcategoria_categoria'] ?? null;

    if ($subcategoria_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Id de subcategoria no valido']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE subcategorias SET 
            subcategoria_nombre = :subcategoria_nombre, 
            subcategoria_cantidad_productos = :subcategoria_cantidad_productos, 
            subcategoria_estado = :subcategoria_estado, 
            subcategoria_categoria = :subcategoria_categoria 
            WHERE subcategoria_id = :subcategoria_id");

        $stmt->bindParam(':subcategoria_nombre', $subcategoria_nombre);
        $stmt->bindParam(':subcategoria_cantidad_productos', $subcategoria_cantidad_productos);
        $stmt->bindParam(':subcategoria_estado', $subcategoria_estado);
        $stmt->bindParam(':subcategoria_categoria', $subcategoria_categoria);
        $stmt->bindParam(':subcategoria_id', $subcategoria_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Subcategoria actualizada correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar subcategoria', 'detalle' => $e->getMessage()]);
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
