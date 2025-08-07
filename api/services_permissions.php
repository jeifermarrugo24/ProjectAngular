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
// Validar token si deseas
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
        save_permisos($data, $conn);
        break;
    case 'consultar':
        get_permisos($data, $conn);
        break;
    case 'eliminar':
        delete_permisos($data, $conn);
        break;
    case 'editar':
        update_permisos($data, $conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Accion no valida']);
        break;
}

function save_permisos($data, $conn)
{
    $permiso_usuario = intval($data['permiso_usuario'] ?? 0);
    $menus = $data['menus'] ?? [];

    if ($permiso_usuario <= 0 || !is_array($menus)) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos invalidos']);
        return;
    }

    try {
        $stmt_insert = $conn->prepare("INSERT INTO permisos (permiso_usuario, permiso_menu) VALUES (:permiso_usuario, :permiso_menu)");
        foreach ($menus as $menu_id) {
            $stmt_insert->bindParam(':permiso_usuario', $permiso_usuario);
            $stmt_insert->bindParam(':permiso_menu', $menu_id);
            $stmt_insert->execute();
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Permisos guardados correctamente', 'id_registro' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar permisos', 'detalle' => $e->getMessage()]);
    }
}

function get_permisos($data, $conn)
{
    $conditions = "WHERE 1=1";
    $params = [];

    if (!empty($data['permiso_usuario'])) {
        $conditions .= " AND permiso_usuario = :permiso_usuario";
        $params[':permiso_usuario'] = intval($data['permiso_usuario']);
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM permisos $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$datos) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontraron permisos']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $datos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar permisos', 'detalle' => $e->getMessage()]);
    }
}

function delete_permisos($data, $conn)
{
    $permiso_id = intval($data['permiso_id'] ?? 0);
    if ($permiso_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Id de permiso no valido']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM permisos WHERE permiso_id = :permiso_id");
        $stmt->bindParam(':permiso_id', $permiso_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Permiso eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar el permiso', 'detalle' => $e->getMessage()]);
    }
}

function update_permisos($data, $conn)
{
    $permiso_id = intval($data['permiso_id'] ?? 0);
    $menus = $data['menus'] ?? [];
    $permiso_usuario = intval($data['permiso_usuario'] ?? 0);

    if ($permiso_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Id de permiso no valido']);
        return;
    }

    try {
        $stmt_delete = $conn->prepare("DELETE FROM permisos WHERE permiso_usuario = :permiso_usuario");
        $stmt_delete->bindParam(':permiso_usuario', $permiso_usuario);
        $stmt_delete->execute();

        // Insertar nuevos permisos
        $stmt_insert = $conn->prepare("INSERT INTO permisos (permiso_usuario, permiso_menu) VALUES (:permiso_usuario, :permiso_menu)");
        foreach ($menus as $menu_id) {
            $stmt_insert->bindParam(':permiso_usuario', $permiso_usuario);
            $stmt_insert->bindParam(':permiso_menu', $menu_id);
            $stmt_insert->execute();
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Permiso actualizado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar el permiso', 'detalle' => $e->getMessage()]);
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
