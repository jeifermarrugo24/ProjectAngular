<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// Configuración
require_once 'db_connection.php';
$conn = get_connection();

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

switch ($accion) {
    case 'guardar':
        save_users($data, $conn);
        break;
    case 'consultar':
        get_users($data, $conn);
        break;
    case 'consultarPerfil':
        get_user_profile($data, $conn);
        break;
    case 'eliminar':
        delete_users($data, $conn);
        break;
    case 'editar':
        update_users($data, $conn);
        break;
    case 'login':
        login_user($data, $conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida']);
        break;
}

function save_users($data, $conn)
{
    $usuario_nombres = $data['usuario_nombres'] ?? '';
    $usuario_apellidos = $data['usuario_apellidos'] ?? '';
    $usuario_email = $data['usuario_email'] ?? '';
    $usuario_password = $data['usuario_password'] ?? '';
    $usuario_perfil = $data['usuario_perfil'] ?? '';
    $usuario_estado = $data['usuario_estado'] ?? '';

    if (!$usuario_nombres || !$usuario_apellidos || !$usuario_perfil || !$usuario_estado || !$usuario_email || !$usuario_password) {
        http_response_code(400);
        echo json_encode(['error' => 'Todos los campos son obligatorios']);
        return;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO usuarios (usuario_nombres, usuario_apellidos, usuario_email, usuarios_password, usuario_perfil, usuario_estado) VALUES (:usuario_nombres, :usuario_apellidos, :usuario_email, :usuario_password, :usuario_perfil, :usuario_estado)");
        $stmt->bindParam(':usuario_nombres', $usuario_nombres);
        $stmt->bindParam(':usuario_apellidos', $usuario_apellidos);
        $stmt->bindParam(':usuario_email', $usuario_email);
        $stmt->bindParam(':usuario_password', md5($usuario_password)); // Encriptar la contraseña
        $stmt->bindParam(':usuario_perfil', $usuario_perfil);
        $stmt->bindParam(':usuario_estado', $usuario_estado);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Usuario guardado exitosamente', 'id_registro' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar el contacto', 'detalle' => $e->getMessage()]);
    }
}

function get_users($data, $conn)
{
    $conditions = "WHERE 1=1";
    $params = [];

    if (!empty($data['usuario_id'])) {
        $conditions .= " AND usuario_id LIKE :usuario_id";
        $params[':usuario_id'] = $data['usuario_id'];
    }

    if (!empty($data['usuario_nombres'])) {
        $conditions .= " AND usuario_nombres LIKE :usuario_nombres";
        $params[':usuario_nombres'] = "%" . $data['usuario_nombres'] . "%";
    }

    if (!empty($data['usuario_apellidos'])) {
        $conditions .= " AND usuario_apellidos LIKE :usuario_apellidos";
        $params[':usuario_apellidos'] = "%" . $data['usuario_apellidos'] . "%";
    }

    if (!empty($data['usuario_email'])) {
        $conditions .= " AND usuario_email LIKE :usuario_email";
        $params[':usuario_email'] = "%" . $data['usuario_email'] . "%";
    }

    if (!empty($data['usuario_password'])) {
        $conditions .= " AND usuario_password = :usuario_password";
        $params[':usuario_password'] = md5($data['usuario_password']);
    }

    if (!empty($data['usuario_perfil'])) {
        $conditions .= " AND usuario_perfil LIKE :usuario_perfil";
        $params[':usuario_perfil'] = $data['usuario_perfil'];
    }

    if (!empty($data['usuario_estado'])) {
        $conditions .= " AND usuario_estado LIKE :usuario_estado";
        $params[':usuario_estado'] = $data['usuario_estado'];
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM usuarios $conditions");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$datos) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontraron usuarios registrados']);
            return;
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $datos]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar los usuarios en la base de datos', 'detalle' => $e->getMessage()]);
    }
}

function delete_users($data, $conn)
{
    $usuario_id = intval($data['usuario_id'] ?? 0);
    if ($usuario_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Id de usuario inválido']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM usuarios WHERE usuario_id = :usuario_id");
        $stmt->bindParam(':usuario_id', $usuario_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Usuario eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar el usuario', 'detalle' => $e->getMessage()]);
    }
}

function update_users($data, $conn)
{
    $usuario_id = intval($data['usuario_id'] ?? 0);
    $usuario_nombres = $data['usuario_nombres'] ?? '';
    $usuario_apellidos = $data['usuario_apellidos'] ?? '';
    $usuario_email = $data['usuario_email'] ?? '';
    $usuario_perfil = $data['usuario_perfil'] ?? '';
    $usuario_estado = $data['usuario_estado'] ?? '';

    if ($usuario_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Campo id usuario invalido']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE usuarios SET usuario_nombres = :usuario_nombres, usuario_apellidos = :usuario_apellidos, usuario_email = :usuario_email,  usuario_perfil = :usuario_perfil, usuario_estado = :usuario_estado  WHERE usuario_id = :usuario_id");
        $stmt->bindParam(':usuario_nombres', $usuario_nombres);
        $stmt->bindParam(':usuario_apellidos', $usuario_apellidos);
        $stmt->bindParam(':usuario_email', $usuario_email);
        $stmt->bindParam(':usuario_perfil', $usuario_perfil);
        $stmt->bindParam(':usuario_estado', $usuario_estado);
        $stmt->bindParam(':usuario_id', $usuario_id);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al editar el usuario', 'detalle' => $e->getMessage()]);
    }
}

function login_user($data, $conn)
{
    //cambia todo por usuario_email y usuario_password
    $usuario_email = $data['usuario_email'] ?? '';
    $usuario_password = md5($data['usuario_password']) ?? '';
    if (!$usuario_email || !$usuario_password) {
        http_response_code(400);
        echo json_encode(['error' => 'Todos los campos son obligatorios']);
        return;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM usuarios WHERE usuario_email = :usuario_email AND usuario_password = :usuario_password");
        $stmt->bindParam(':usuario_email', $usuario_email);
        $stmt->bindParam(':usuario_password', $usuario_password);
        $stmt->execute();

        $datos = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$datos) {
            http_response_code(401);
            echo json_encode(['error' => 'Credenciales no validas']);
            return;
        }

        // Aquí podrías generar un token JWT real. Por simplicidad, devolvemos un token con datos del usuario.
        $userData = [
            'usuario_id' => $datos['usuario_id'],
            'usuario_nombres' => $datos['usuario_nombres'],
            'usuario_apellidos' => $datos['usuario_apellidos'],
            'usuario_perfil' => $datos['usuario_perfil'],
            'usuario_estado' => $datos['usuario_estado'],
            'usuario_email' => $datos['usuario_email']
        ];

        $token = base64_encode(json_encode($userData));

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Login exitoso', 'token' => $token]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al procesar el login', 'detalle' => $e->getMessage()]);
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

function get_user_profile($data, $conn)
{
    $usuario_id = intval($data['usuario_id'] ?? 0);

    if ($usuario_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de usuario es requerido']);
        return;
    }

    try {
        error_log("=== CONSULTANDO PERFIL DEL USUARIO ===");
        error_log("Usuario ID recibido: " . $usuario_id);

        $sql = "SELECT usuario_id, usuario_nombres, usuario_apellidos, usuario_email, 
                       usuario_perfil, usuario_estado 
                FROM usuarios 
                WHERE usuario_id = :usuario_id 
                AND usuario_estado = 'A'";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuario_id);
        $stmt->execute();

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario no encontrado o inactivo']);
            return;
        }

        error_log("Usuario encontrado: " . $usuario['usuario_nombres']);
        error_log("Perfil del usuario: " . $usuario['usuario_perfil']);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $usuario,
            'message' => 'Perfil de usuario consultado correctamente'
        ]);
    } catch (PDOException $e) {
        error_log("Error en get_user_profile: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error al consultar perfil del usuario', 'detalle' => $e->getMessage()]);
    }
}
