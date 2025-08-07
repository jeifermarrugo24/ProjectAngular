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
        save_menus($data, $conn);
        break;
    case 'consultar':
        get_menus($data, $conn);
        break;
    case 'eliminar':
        delete_menus($data, $conn);
        break;
    case 'editar':
        update_menus($data, $conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Accion no valida']);
        break;
}

function save_menus($data, $conn)
{
    $menu_nombre = $data['menu_nombre'] ?? '';
    $menu_tipo = $data['menu_tipo'] ?? 'default';
    $menu_id_padre = isset($data['menu_id_padre']) ? intval($data['menu_id_padre']) : null;
    $menu_path = $data['menu_path'] ?? '';
    if (!$menu_nombre) {
        http_response_code(400);
        echo json_encode(['error' => 'El campo menu nombre es obligatorio']);
        return;
    }

    try {

        $stmt = $conn->prepare("INSERT INTO menus (menu_nombre, menu_tipo, menu_id_padre, menu_path) VALUES (:menu_nombre,:menu_tipo, :menu_id_padre, :menu_path)");
        $stmt->bindParam(':menu_nombre', $menu_nombre);
        $stmt->bindParam(':menu_tipo', $menu_tipo);
        $stmt->bindParam(':menu_path', $menu_path);
        if ($menu_id_padre !== null) {
            $stmt->bindParam(':menu_id_padre', $menu_id_padre);
        } else {
            $stmt->bindValue(':menu_id_padre', null, PDO::PARAM_NULL);
        }
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Menu guardado correctamente', 'id_registro' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar el menu', 'detalle' => $e->getMessage()]);
    }
}

function get_menus($data, $conn)
{
    $conditions = "WHERE 1=1";
    $params = [];

    if (!empty($data['menu_nombre'])) {
        $conditions .= " AND menu_nombre LIKE :menu_nombre";
        $params[':menu_nombre'] = "%" . $data['menu_nombre'] . "%";
    }
    if (!empty($data['menu_tipo'])) {
        $conditions .= " AND menu_tipo = :menu_tipo";
        $params[':menu_tipo'] = $data['menu_tipo'];
    }

    if (isset($data['menu_id_padre']) && $data['menu_id_padre'] !== '') {
        $conditions .= " AND menu_id_padre = :menu_id_padre";
        $params[':menu_id_padre'] = intval($data['menu_id_padre']);
    }

    if (!empty($data['menu_id'])) {
        $conditions .= " AND menu_id = :menu_id";
        $params[':menu_id'] = intval($data['menu_id']);
    }

    if (isset($data['menu_path']) && $data['menu_path'] !== '') {
        $conditions .= " AND menu_path = :menu_path";
        $params[':menu_path'] = $data['menu_path'];
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM menus $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$datos) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontraron menus']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $datos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar los menus', 'detalle' => $e->getMessage()]);
    }
}

function delete_menus($data, $conn)
{
    $menu_id = intval($data['menu_id'] ?? 0);
    if ($menu_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'id de menu no valido']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM menus WHERE menu_id = :menu_id");
        $stmt->bindParam(':menu_id', $menu_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Menu eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar el menu', 'detalle' => $e->getMessage()]);
    }
}

function update_menus($data, $conn)
{
    $menu_id = intval($data['menu_id'] ?? 0);
    $menu_nombre = $data['menu_nombre'] ?? '';
    $menu_tipo = $data['menu_tipo'] ?? 'default';
    $menu_id_padre = isset($data['menu_id_padre']) ? intval($data['menu_id_padre']) : null;
    $menu_path = $data['menu_path'] ?? '';

    if ($menu_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Campo id menu invalido']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE menus SET menu_nombre = :menu_nombre, menu_tipo = :menu_tipo, menu_id_padre = :menu_id_padre, menu_path = :menu_path WHERE menu_id = :menu_id");
        $stmt->bindParam(':menu_nombre', $menu_nombre);
        $stmt->bindParam(':menu_tipo', $menu_tipo);
        $stmt->bindParam(':menu_id', $menu_id);
        if ($menu_id_padre !== null) {
            $stmt->bindParam(':menu_id_padre', $menu_id_padre);
        } else {
            $stmt->bindValue(':menu_id_padre', null, PDO::PARAM_NULL);
        }
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Menu actualizado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar el menu', 'detalle' => $e->getMessage()]);
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
