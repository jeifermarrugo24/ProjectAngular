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

/*
if (!validar_token($jwt, $token_secreto)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token invalido']);
    exit;
}
*/

$data = json_decode(file_get_contents("php://input"), true);
$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'guardar':
        save_roles($data, $conn);
        break;
    case 'consultar':
        get_roles($data, $conn);
        break;
    case 'eliminar':
        delete_roles($data, $conn);
        break;
    case 'editar':
        update_roles($data, $conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Accion no valida']);
        break;
}

function save_roles($data, $conn)
{
    $rol_nombre = $data['rol_nombre'] ?? '';

    if (!$rol_nombre) {
        http_response_code(400);
        echo json_encode(['error' => 'El campo rol nombre es obligatorio']);
        return;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO roles (rol_nombre) VALUES (:rol_nombre)");
        $stmt->bindParam(':rol_nombre', $rol_nombre);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Rol guardado correctamente', 'id_registro' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar el rol', 'detalle' => $e->getMessage()]);
    }
}

function get_roles($data, $conn)
{
    $conditions = "WHERE 1=1";
    $params = [];

    if (!empty($data['rol_nombre'])) {
        $conditions .= " AND rol_nombre LIKE :rol_nombre";
        $params[':rol_nombre'] = "%" . $data['rol_nombre'] . "%";
    }

    if (!empty($data['rol_id'])) {
        $conditions .= " AND rol_id = :rol_id";
        $params[':rol_id'] = intval($data['rol_id']);
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM roles $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$datos) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontraron roles']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $datos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar los roles', 'detalle' => $e->getMessage()]);
    }
}

function delete_roles($data, $conn)
{
    $rol_id = intval($data['rol_id'] ?? 0);
    if ($rol_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'id de rol no valido']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM roles WHERE rol_id = :rol_id");
        $stmt->bindParam(':rol_id', $rol_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Rol eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar el rol', 'detalle' => $e->getMessage()]);
    }
}

function update_roles($data, $conn)
{
    $rol_id = intval($data['rol_id'] ?? 0);
    $rol_nombre = $data['rol_nombre'] ?? '';

    if ($rol_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Campo id rol invalido']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE roles SET rol_nombre = :rol_nombre WHERE rol_id = :rol_id");
        $stmt->bindParam(':rol_nombre', $rol_nombre);
        $stmt->bindParam(':rol_id', $rol_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Rol actualizado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar el rol', 'detalle' => $e->getMessage()]);
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
