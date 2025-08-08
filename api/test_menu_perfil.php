<?php
// Test para verificar el endpoint consultarDatosMenuPorPerfil

$url = 'http://localhost/skinatech/api/consultarDatosMenuPorPerfil';

// Datos de prueba - perfil 1 (Administrador)
$data = [
    'perfil_id' => 1
];

$json_data = json_encode($data);

$options = [
    'http' => [
        'header' => [
            "Content-Type: application/json",
            "Authorization: Bearer test_token"
        ],
        'method' => 'POST',
        'content' => $json_data
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "=== PRUEBA ENDPOINT consultarDatosMenuPorPerfil ===\n";
echo "URL: $url\n";
echo "Datos enviados: " . $json_data . "\n";
echo "Respuesta:\n";
echo $result . "\n";

// Decodificar respuesta para análisis
$response = json_decode($result, true);
if ($response) {
    echo "\n=== ANÁLISIS DE RESPUESTA ===\n";
    echo "Success: " . ($response['success'] ? 'true' : 'false') . "\n";
    echo "Message: " . ($response['message'] ?? 'N/A') . "\n";
    echo "Menús encontrados: " . (isset($response['data']) ? count($response['data']) : 0) . "\n";

    if (isset($response['data']) && is_array($response['data'])) {
        echo "\n=== MENÚS OBTENIDOS ===\n";
        foreach ($response['data'] as $index => $menu) {
            echo "Menú " . ($index + 1) . ":\n";
            echo "  - ID: " . ($menu['menu_id'] ?? 'N/A') . "\n";
            echo "  - Nombre: " . ($menu['menu_nombre'] ?? 'N/A') . "\n";
            echo "  - Tipo: " . ($menu['menu_tipo'] ?? 'N/A') . "\n";
            echo "  - Path: " . ($menu['menu_path'] ?? 'N/A') . "\n";
            echo "  - Padre: " . ($menu['menu_id_padre'] ?? 'N/A') . "\n";
            echo "  - Orden: " . ($menu['menu_orden'] ?? 'N/A') . "\n";
        }
    }

    if (isset($response['debug'])) {
        echo "\n=== DEBUG INFO ===\n";
        echo "Perfil ID: " . ($response['debug']['perfil_id'] ?? 'N/A') . "\n";
        echo "Menús count: " . ($response['debug']['menus_count'] ?? 'N/A') . "\n";
        if (isset($response['debug']['permisos_count'])) {
            echo "Permisos count: " . $response['debug']['permisos_count'] . "\n";
        }
    }
}
