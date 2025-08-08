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
    echo json_encode(['error' => 'Método no permitido']);
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
if (!validar_token($jwt, $token_secreto)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido']);
    exit;
}
*/

$data = json_decode(file_get_contents("php://input"), true);
$accion = $_GET['accion'] ?? '';

// Debug temporal
error_log("Acción recibida: '" . $accion . "'");
error_log("Datos recibidos: " . json_encode($data));

switch ($accion) {
    case 'guardar':
        save_categories($data, $conn);
        break;
    case 'consultar':
        get_categories($data, $conn);
        break;
    case 'eliminar':
        delete_categories($data, $conn);
        break;
    case 'editar':
        update_categories($data, $conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Accion no valida']);
        break;
}


function save_categories($data, $conn)
{
    $categoria_nombre = trim($data['categoria_nombre'] ?? '');
    $categoria_estado = trim($data['categoria_estado'] ?? '');

    if (empty($categoria_nombre) || empty($categoria_estado)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Todos los campos son obligatorios',
            'received' => [
                'categoria_nombre' => $categoria_nombre,
                'categoria_estado' => $categoria_estado,
                'all_data' => $data
            ]
        ]);
        return;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO categorias (categoria_nombre, categoria_estado) VALUES (:categoria_nombre, :categoria_estado)");
        $stmt->bindParam(':categoria_nombre', $categoria_nombre);
        $stmt->bindParam(':categoria_estado', $categoria_estado);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Categoría guardada correctamente', 'id_registro' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar la categoría', 'detalle' => $e->getMessage()]);
    }
}

function get_categories($data, $conn)
{
    $conditions = "WHERE 1=1";
    $params = [];

    if (!empty($data['categoria_nombre'])) {
        $conditions .= " AND categoria_nombre LIKE :categoria_nombre";
        $params[':categoria_nombre'] = "%" . $data['categoria_nombre'] . "%";
    }

    if (!empty($data['categoria_estado'])) {
        $conditions .= " AND categoria_estado LIKE :categoria_estado";
        $params[':categoria_estado'] = $data['categoria_estado'];
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM categorias $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$datos) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontraron categorías registradas']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $datos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar las categorías', 'detalle' => $e->getMessage()]);
    }
}

function delete_categories($data, $conn)
{
    $categoria_id = intval($data['categoria_id'] ?? 0);
    if ($categoria_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'id de categoría no valido']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM categorias WHERE categoria_id = :categoria_id");
        $stmt->bindParam(':categoria_id', $categoria_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Categoría eliminada correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar la categoría', 'detalle' => $e->getMessage()]);
    }
}

function update_categories($data, $conn)
{
    $categoria_id = intval($data['categoria_id'] ?? 0);
    $categoria_nombre = $data['categoria_nombre'] ?? '';
    $categoria_estado = $data['categoria_estado'] ?? '';

    if ($categoria_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Campo id categoria invalido']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE categorias SET categoria_nombre = :categoria_nombre, categoria_estado = :categoria_estado WHERE categoria_id = :categoria_id");
        $stmt->bindParam(':categoria_nombre', $categoria_nombre);
        $stmt->bindParam(':categoria_estado', $categoria_estado);
        $stmt->bindParam(':categoria_id', $categoria_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Categoria actualizada correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar la categoria', 'detalle' => $e->getMessage()]);
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
