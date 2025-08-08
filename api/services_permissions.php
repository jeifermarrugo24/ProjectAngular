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
    case 'consultarMenusConPermisos':
        get_menus_with_permissions($data, $conn);
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
    $permiso_perfil = intval($data['permiso_perfil'] ?? 0);
    $menus = $data['menus'] ?? [];

    if ($permiso_perfil <= 0 || !is_array($menus)) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos invalidos']);
        return;
    }

    try {
        $stmt_insert = $conn->prepare("INSERT INTO permisos (permiso_perfil, permiso_menu) VALUES (:permiso_perfil, :permiso_menu)");
        foreach ($menus as $menu_id) {
            $stmt_insert->bindParam(':permiso_perfil', $permiso_perfil);
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

    if (!empty($data['permiso_perfil'])) {
        $conditions .= " AND permiso_perfil = :permiso_perfil";
        $params[':permiso_perfil'] = intval($data['permiso_perfil']);
    }

    if (!empty($data['permiso_menu'])) {
        $conditions .= " AND permiso_menu = :permiso_menu";
        $params[':permiso_menu'] = intval($data['permiso_menu']);
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM permisos $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Si no hay permisos, devolver array vacío (no error)
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $datos,
            'message' => count($datos) > 0 ? 'Permisos encontrados' : 'No hay permisos asignados'
        ]);
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
    $permiso_perfil = intval($data['permiso_perfil'] ?? 0);

    if ($permiso_perfil <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Campo permiso_perfil es requerido']);
        return;
    }

    try {
        // Eliminar permisos existentes del perfil
        $stmt_delete = $conn->prepare("DELETE FROM permisos WHERE permiso_perfil = :permiso_perfil");
        $stmt_delete->bindParam(':permiso_perfil', $permiso_perfil);
        $stmt_delete->execute();

        // Insertar nuevos permisos
        if (!empty($menus) && is_array($menus)) {
            $stmt_insert = $conn->prepare("INSERT INTO permisos (permiso_perfil, permiso_menu) VALUES (:permiso_perfil, :permiso_menu)");
            foreach ($menus as $menu_id) {
                $stmt_insert->bindParam(':permiso_perfil', $permiso_perfil);
                $stmt_insert->bindParam(':permiso_menu', $menu_id);
                $stmt_insert->execute();
            }
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Permisos actualizados correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar permisos', 'detalle' => $e->getMessage()]);
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

function get_menus_with_permissions($data, $conn)
{
    $permiso_perfil = intval($data['permiso_perfil'] ?? 0);

    if ($permiso_perfil <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Campo permiso_perfil es requerido']);
        return;
    }

    try {
        // Consulta que obtiene todos los menús con información de si están asignados al perfil
        $sql = "SELECT 
                    m.menu_id,
                    m.menu_nombre,
                    m.menu_tipo,
                    m.menu_path,
                    m.menu_id_padre,
                    CASE 
                        WHEN p.permiso_menu IS NOT NULL THEN 1 
                        ELSE 0 
                    END as selected
                FROM menus m 
                LEFT JOIN permisos p ON m.menu_id = p.permiso_menu AND p.permiso_perfil = :permiso_perfil
                ORDER BY m.menu_tipo ASC, m.menu_nombre ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':permiso_perfil', $permiso_perfil);
        $stmt->execute();

        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $datos,
            'message' => 'Menús con permisos consultados correctamente',
            'perfil_id' => $permiso_perfil
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar menús con permisos', 'detalle' => $e->getMessage()]);
    }
}
