-- Script para insertar datos de ejemplo para probar el sistema de menús por perfil

-- ============================================
-- INSERTAR MENÚS DE EJEMPLO CON JERARQUÍA
-- ============================================

-- Limpiar datos existentes (opcional)
-- DELETE FROM permisos;
-- DELETE FROM menus;

-- Insertar menús principales (padres)
INSERT INTO menus (menu_nombre, menu_tipo, menu_path, menu_id_padre, menu_orden, menu_estado) VALUES 
('Dashboard', 'DASHBOARD', '/dashboard', NULL, 1, 'Activo'),
('Gestión de Usuarios', 'USUARIO', '/users', NULL, 2, 'Activo'),
('Gestión de Categorías', 'CATEGORIA', '/categories', NULL, 4, 'Activo'),
('Gestión de Productos', 'PRODUCTOS', '/productos', NULL, 6, 'Activo'),
('Administración', 'ADMIN', '#', NULL, 8, 'Activo');

-- Obtener los IDs de los menús padre recién insertados
SET @dashboard_id = LAST_INSERT_ID() - 4;
SET @usuarios_id = LAST_INSERT_ID() - 3;
SET @categorias_id = LAST_INSERT_ID() - 2;
SET @productos_id = LAST_INSERT_ID() - 1;
SET @admin_id = LAST_INSERT_ID();

-- Insertar submenús (hijos)
INSERT INTO menus (menu_nombre, menu_tipo, menu_path, menu_id_padre, menu_orden, menu_estado) VALUES 
-- Submenús de Usuarios
('Listar Usuarios', 'USUARIO', '/users', @usuarios_id, 3, 'Activo'),
('Registrar Usuario', 'USUARIO', '/users/registrar', @usuarios_id, 4, 'Activo'),

-- Submenús de Categorías  
('Listar Categorías', 'CATEGORIA', '/categories', @categorias_id, 5, 'Activo'),
('Registrar Categoría', 'CATEGORIA', '/categories/registrar', @categorias_id, 6, 'Activo'),

-- Submenús de Productos
('Listar Productos', 'PRODUCTOS', '/productos', @productos_id, 7, 'Activo'),
('Registrar Producto', 'PRODUCTOS', '/productos/registrar', @productos_id, 8, 'Activo'),

-- Submenús de Administración
('Gestión de Menús', 'ADMIN', '/menus', @admin_id, 9, 'Activo'),
('Gestión de Roles', 'ADMIN', '/roles', @admin_id, 10, 'Activo'),
('Gestión de Permisos', 'ADMIN', '/permisos', @admin_id, 11, 'Activo');

-- ============================================
-- INSERTAR PERMISOS DE EJEMPLO
-- ============================================

-- Permisos para ADMINISTRADOR (perfil 1) - Acceso completo
INSERT INTO permisos (permiso_perfil, permiso_menu) 
SELECT 1, menu_id FROM menus WHERE menu_estado = 'Activo';

-- Permisos para USUARIO BÁSICO (perfil 2) - Acceso limitado
INSERT INTO permisos (permiso_perfil, permiso_menu) VALUES 
(2, @dashboard_id),  -- Dashboard
(2, @usuarios_id),   -- Gestión de Usuarios (padre)
(2, @usuarios_id + 1), -- Listar Usuarios
(2, @categorias_id), -- Gestión de Categorías (padre)
(2, @categorias_id + 1); -- Listar Categorías

-- ============================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Verificar menús insertados con jerarquía
SELECT 'MENÚS CON JERARQUÍA' as tabla;
SELECT 
    m.menu_id, 
    m.menu_nombre, 
    m.menu_tipo, 
    m.menu_path, 
    m.menu_id_padre,
    CASE 
        WHEN m.menu_id_padre IS NULL THEN 'PADRE'
        ELSE CONCAT('HIJO DE ', p.menu_nombre)
    END as jerarquia,
    m.menu_orden, 
    m.menu_estado 
FROM menus m 
LEFT JOIN menus p ON m.menu_id_padre = p.menu_id
ORDER BY 
    COALESCE(m.menu_id_padre, m.menu_id), 
    m.menu_orden;

-- Verificar permisos por perfil
SELECT 'PERMISOS POR PERFIL' as tabla;
SELECT 
    p.permiso_perfil,
    CASE p.permiso_perfil 
        WHEN 1 THEN 'ADMINISTRADOR'
        WHEN 2 THEN 'USUARIO BÁSICO'
        ELSE 'OTRO'
    END as perfil_nombre,
    COUNT(*) as total_permisos 
FROM permisos p 
GROUP BY p.permiso_perfil;

-- Verificar menús para perfil administrador
SELECT 'MENÚS PARA PERFIL 1 (ADMIN) - CON JERARQUÍA' as consulta;
SELECT DISTINCT 
    m.menu_id, 
    m.menu_nombre, 
    m.menu_tipo, 
    m.menu_path,
    m.menu_id_padre,
    m.menu_orden, 
    m.menu_estado,
    CASE 
        WHEN m.menu_id_padre IS NULL THEN 'PADRE'
        ELSE 'HIJO'
    END as nivel
FROM menus m 
INNER JOIN permisos p ON m.menu_id = p.permiso_menu 
WHERE p.permiso_perfil = 1 
AND m.menu_estado = 'Activo'
ORDER BY 
    COALESCE(m.menu_id_padre, m.menu_id), 
    m.menu_orden;

-- Verificar menús para perfil básico
SELECT 'MENÚS PARA PERFIL 2 (BÁSICO) - CON JERARQUÍA' as consulta;
SELECT DISTINCT 
    m.menu_id, 
    m.menu_nombre, 
    m.menu_tipo, 
    m.menu_path,
    m.menu_id_padre,
    m.menu_orden, 
    m.menu_estado,
    CASE 
        WHEN m.menu_id_padre IS NULL THEN 'PADRE'
        ELSE 'HIJO'
    END as nivel
FROM menus m 
INNER JOIN permisos p ON m.menu_id = p.permiso_menu 
WHERE p.permiso_perfil = 2 
AND m.menu_estado = 'Activo'
ORDER BY 
    COALESCE(m.menu_id_padre, m.menu_id), 
    m.menu_orden;
