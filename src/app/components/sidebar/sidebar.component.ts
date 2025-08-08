import { Component, OnInit } from "@angular/core";
import { MenusService } from "../../services/menus/menus.service";
import { AuthService } from "../../services/auth/auth.service";
import { Menu } from "../../models/menu.model";

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  type: string;
  menu_id?: number;
  menu_padre_id?: number | null;
  menu_orden?: number;
  children?: RouteInfo[];
}

// Mantener las rutas estáticas como fallback
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    type: "DASHBOARD",
    icon: "dashboard",
    class: "",
  },
  {
    path: "/users/registrar",
    title: "Registrar usuarios",
    type: "USUARIO",
    icon: "person",
    class: "",
  },
  {
    path: "/users",
    title: "Listado de usuarios",
    type: "USUARIO",
    icon: "content_paste",
    class: "",
  },
  {
    path: "/categories/registrar",
    title: "Registrar Categorias",
    type: "CATEGORIA",
    icon: "playlist_add",
    class: "",
  },
  {
    path: "/categories",
    title: "Listado de categorias",
    type: "CATEGORIA",
    icon: "content_paste",
    class: "",
  },
  {
    path: "/subcategories/registrar",
    title: "Registrar subcategoria",
    type: "SUBCATEGORIA",
    icon: "playlist_add",
    class: "",
  },
  {
    path: "/subcategories",
    title: "Listado de subcategoria",
    type: "SUBCATEGORIA",
    icon: "content_paste",
    class: "",
  },
  {
    path: "/productos/registrar",
    title: "Registrar productos",
    type: "PRODUCTOS",
    icon: "playlist_add",
    class: "",
  },
  {
    path: "/productos",
    title: "Listado de productos",
    type: "PRODUCTOS",
    icon: "content_paste",
    class: "",
  },
  {
    path: "/menus/registrar",
    title: "Registrar Menu",
    type: "MENU",
    icon: "playlist_add",
    class: "",
  },
  {
    path: "/menus",
    title: "Listado de Menus",
    type: "MENU",
    icon: "content_paste",
    class: "",
  },
  {
    path: "/roles/registrar",
    title: "Registrar roles",
    type: "ROLES",
    icon: "playlist_add",
    class: "",
  },
  {
    path: "/roles",
    title: "Listado de roles",
    type: "ROLES",
    icon: "content_paste",
    class: "",
  },
  {
    path: "/permisos",
    title: "Registrar permisos por roles",
    type: "PERMISOS",
    icon: "playlist_add",
    class: "",
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
  dynamicMenus: Menu[] = [];
  isLoadingMenus: boolean = false;
  useStaticMenus: boolean = false;
  expandedMenus: Set<number> = new Set<number>();

  constructor(
    private menusService: MenusService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log("=== SIDEBAR COMPONENT INIT ===");

    // Suscribirse a cambios del usuario actual
    this.authService.currentUser$.subscribe((user) => {
      console.log("🔄 Usuario cambió:", user);
      if (user) {
        this.loadUserMenus();
      } else {
        console.log("👤 No hay usuario, cargando menús estáticos");
        this.loadStaticMenus();
      }
    });

    // También cargar inmediatamente por si ya hay un usuario
    this.loadUserMenus();
  }

  /**
   * Cargar menús basados en el perfil del usuario
   */
  loadUserMenus(): void {
    console.log("=== INICIO loadUserMenus ===");

    // Verificar localStorage
    const authToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    console.log(
      "🔐 Token en localStorage:",
      authToken ? "Existe" : "No existe"
    );
    console.log(
      "👤 UserData en localStorage:",
      userData ? "Existe" : "No existe"
    );
    if (userData) {
      console.log("📄 Datos parseados:", JSON.parse(userData));
    }

    const currentUser = this.authService.getCurrentUser();
    console.log("Usuario actual obtenido del service:", currentUser);

    if (!currentUser) {
      console.warn("❌ No hay usuario autenticado");
      this.loadStaticMenus();
      return;
    }

    if (!currentUser.usuario_id) {
      console.warn("❌ Usuario sin ID");
      console.log("Datos del usuario:", currentUser);
      this.loadStaticMenus();
      return;
    }

    console.log("=== CONSULTANDO PERFIL DEL USUARIO POR ID ===");
    console.log("Usuario ID:", currentUser.usuario_id);

    this.isLoadingMenus = true;

    // Primero consultar el perfil actual del usuario desde la base de datos
    this.authService.getUserProfile(currentUser.usuario_id).subscribe({
      next: (profileResponse) => {
        console.log("=== RESPUESTA PERFIL USUARIO ===");
        console.log("Respuesta completa:", profileResponse);

        if (profileResponse.success && profileResponse.data) {
          const userProfile = profileResponse.data;
          console.log("✅ Perfil obtenido desde BD:", userProfile);
          console.log("Perfil del usuario:", userProfile.usuario_perfil);

          // Ahora cargar menús con el perfil correcto
          this.loadMenusForProfile(Number(userProfile.usuario_perfil));
        } else {
          console.warn("⚠️ No se pudo obtener el perfil del usuario");
          console.log("Usando menús estáticos como fallback");
          this.loadStaticMenus();
        }
      },
      error: (error) => {
        console.error("❌ Error al consultar perfil del usuario:", error);
        console.log("Fallback: usando menús estáticos");
        this.loadStaticMenus();
        this.isLoadingMenus = false;
      },
    });
  }

  /**
   * Cargar menús para un perfil específico
   */
  private loadMenusForProfile(perfilId: number): void {
    console.log("=== CARGANDO MENÚS PARA PERFIL ===");
    console.log("Perfil ID:", perfilId);

    // Primero probar la conectividad básica
    console.log("🧪 Probando conectividad básica...");
    this.menusService.testConnection().subscribe({
      next: (testResponse) => {
        console.log("✅ Conectividad OK:", testResponse);
      },
      error: (testError) => {
        console.error("❌ Error de conectividad:", testError);
      },
    });

    this.menusService.getMenusByProfile(perfilId).subscribe({
      next: (response) => {
        console.log("=== RESPUESTA COMPLETA DEL BACKEND ===");
        console.log("Respuesta RAW:", response);
        console.log("response.success:", response.success);
        console.log("response.data:", response.data);
        console.log("Tipo de response.data:", typeof response.data);
        console.log("Es array?:", Array.isArray(response.data));

        if (response.data) {
          console.log("Longitud del array:", response.data.length);
          response.data.forEach((item: any, index: number) => {
            console.log(`Elemento ${index}:`, item);
          });
        }

        if (response.success && response.data && response.data.length > 0) {
          console.log("✅ MENÚS DINÁMICOS ENCONTRADOS");
          console.log("Cantidad de menús:", response.data.length);

          this.dynamicMenus = response.data;
          this.processDynamicMenus();
          this.useStaticMenus = false;

          console.log("✅ Menús dinámicos cargados y procesados exitosamente");
        } else {
          console.warn("⚠️ NO SE ENCONTRARON MENÚS PARA EL PERFIL");
          console.log("Success:", response.success);
          console.log("Data length:", response.data?.length || 0);
          console.log("Datos recibidos:", response.data);
          console.log(
            "Debug info:",
            (response as any).debug || "No debug info"
          );
          console.log("🔄 Fallback: usando menús estáticos");
          this.loadStaticMenus();
        }

        this.isLoadingMenus = false;
      },
      error: (error) => {
        console.error("❌ Error al cargar menús dinámicos:", error);
        console.error("Error completo:", error);
        this.loadStaticMenus();
        this.isLoadingMenus = false;
      },
    });
  }

  /**
   * Procesar menús dinámicos del backend y convertirlos a rutas multinivel
   */
  processDynamicMenus(): void {
    console.log("=== PROCESANDO MENÚS DINÁMICOS ===");
    console.log("Menús recibidos del backend:", this.dynamicMenus);
    console.log("Cantidad total de menús:", this.dynamicMenus.length);

    // Log detallado de cada menú
    this.dynamicMenus.forEach((menu, index) => {
      console.log(`Menú ${index + 1}:`, {
        id: menu.menu_id,
        nombre: menu.menu_nombre,
        tipo: menu.menu_tipo,
        path: menu.menu_path,
        padre_id: menu.menu_id_padre,
        orden: menu.menu_orden,
        estado: menu.menu_estado,
      });
    });

    // Convertir menús del backend a formato RouteInfo con estructura jerárquica
    const allRoutes: RouteInfo[] = this.dynamicMenus.map((menu) => ({
      path: menu.menu_path || "#",
      title: menu.menu_nombre || "Sin título",
      icon: this.getIconForMenuType(menu.menu_tipo || "GENERAL"),
      class: "",
      type: menu.menu_tipo || "GENERAL",
      menu_id: menu.menu_id,
      menu_padre_id: menu.menu_id_padre,
      menu_orden: menu.menu_orden || 0,
      children: [],
    }));

    console.log("Rutas convertidas (antes de jerarquía):", allRoutes);
    console.log("Total rutas convertidas:", allRoutes.length);

    // Construir estructura jerárquica
    const hierarchicalRoutes = this.buildHierarchicalStructure(allRoutes);
    console.log("Estructura jerárquica construida:", hierarchicalRoutes);
    console.log("Total rutas en jerarquía:", hierarchicalRoutes.length);

    // Mostrar detalles de cada menú con sus hijos
    hierarchicalRoutes.forEach((menu, index) => {
      console.log(`Menú jerárquico ${index + 1}:`, {
        tipo: menu.type,
        nombre: menu.title,
        id: menu.menu_id,
        hijos: menu.children?.length || 0,
        nombres_hijos: menu.children?.map((c: any) => c.title) || [],
      });
    });

    // Agrupar por tipo manteniendo la jerarquía
    const grouped = new Map<string, any[]>();

    for (const route of hierarchicalRoutes) {
      if (!grouped.has(route.type)) {
        grouped.set(route.type, []);
      }
      grouped.get(route.type)?.push(route);
    }

    // Convertir el mapa a array de arrays (formato esperado por el template)
    this.menuItems = Array.from(grouped.values());

    console.log("Menús agrupados por tipo:", this.menuItems);
    console.log("Estructura final para el sidebar:", this.menuItems);
    console.log("Total grupos creados:", this.menuItems.length);

    // Contar total de menús mostrados
    const totalMenusShown = this.menuItems.reduce((total, group) => {
      return total + group.length;
    }, 0);
    console.log("Total menús que se mostrarán:", totalMenusShown);
  }

  /**
   * Construir estructura jerárquica de menús (padre -> hijos)
   */
  private buildHierarchicalStructure(routes: any[]): any[] {
    console.log("=== CONSTRUYENDO JERARQUÍA ===");
    console.log("Rutas recibidas:", routes);

    // Crear un mapa para acceso rápido por ID
    const routeMap = new Map();
    routes.forEach((route) => {
      routeMap.set(route.menu_id, { ...route, children: [] });
    });

    console.log("Mapa de rutas creado:", routeMap);

    // Separar menús padre de menús hijo
    const rootMenus: any[] = [];
    const childMenus: any[] = [];

    routes.forEach((route) => {
      if (!route.menu_padre_id || route.menu_padre_id === null) {
        rootMenus.push(routeMap.get(route.menu_id));
        console.log(
          `Menú PADRE encontrado: ${route.title} (ID: ${route.menu_id})`
        );
      } else {
        childMenus.push(route);
        console.log(
          `Menú HIJO encontrado: ${route.title} (ID: ${route.menu_id}, Padre: ${route.menu_padre_id})`
        );
      }
    });

    console.log("Menús padre:", rootMenus);
    console.log("Menús hijo:", childMenus);

    // Asignar hijos a sus padres
    childMenus.forEach((child) => {
      const parent = routeMap.get(child.menu_padre_id);
      if (parent) {
        parent.children.push(child);
        console.log(
          `Asignando hijo "${child.title}" al padre "${parent.title}"`
        );
      } else {
        console.warn(
          `⚠️ No se encontró el padre (ID: ${child.menu_padre_id}) para el hijo "${child.title}"`
        );
        // Si no se encuentra el padre, agregar como menú independiente
        const orphanMenu = routeMap.get(child.menu_id);
        if (orphanMenu) {
          rootMenus.push(orphanMenu);
          console.log(`Agregando menú huérfano como raíz: ${child.title}`);
        }
      }
    });

    // Ordenar menús por el campo menu_orden
    const sortedRootMenus = rootMenus.sort(
      (a, b) => (a.menu_orden || 0) - (b.menu_orden || 0)
    );

    // Ordenar también los hijos de cada padre
    sortedRootMenus.forEach((parent) => {
      if (parent.children && parent.children.length > 0) {
        parent.children.sort(
          (a: any, b: any) => (a.menu_orden || 0) - (b.menu_orden || 0)
        );
        console.log(
          `Hijos ordenados para "${parent.title}":`,
          parent.children.map((c: any) => c.title)
        );
      }
    });

    console.log("Estructura jerárquica final:", sortedRootMenus);
    console.log("Total menús en estructura final:", sortedRootMenus.length);

    // Verificar que todos los menús estén incluidos
    const totalMenusInStructure = sortedRootMenus.reduce((count, parent) => {
      return count + 1 + (parent.children ? parent.children.length : 0);
    }, 0);
    console.log("Total menús incluidos en estructura:", totalMenusInStructure);
    console.log("Total menús originales:", routes.length);

    return sortedRootMenus;
  }

  /**
   * Obtener icono apropiado según el tipo de menú
   */
  private getIconForMenuType(menuType: string): string {
    const iconMap: { [key: string]: string } = {
      DASHBOARD: "dashboard",
      USUARIO: "person",
      CATEGORIA: "category",
      SUBCATEGORIA: "bookmark",
      PRODUCTOS: "inventory",
      MENU: "menu",
      ROLES: "group",
      PERMISOS: "security",
      GENERAL: "folder",
      default: "folder",
    };

    return iconMap[menuType.toUpperCase()] || iconMap["default"];
  }

  /**
   * Cargar menús estáticos como fallback basados en el perfil
   */
  loadStaticMenus(): void {
    console.log("=== CARGANDO MENÚS ESTÁTICOS COMO FALLBACK ===");
    const currentUser = this.authService.getCurrentUser();

    // Definir menús básicos por perfil
    let allowedRoutes: RouteInfo[] = [];

    if (currentUser && currentUser.usuario_perfil) {
      const perfilId = Number(currentUser.usuario_perfil);
      console.log("Filtrando menús estáticos para perfil:", perfilId);

      if (perfilId === 1) {
        // Administrador: acceso completo
        allowedRoutes = ROUTES;
        console.log("Perfil ADMINISTRADOR: acceso completo");
      } else {
        // Otros perfiles: acceso limitado
        allowedRoutes = ROUTES.filter(
          (route) =>
            route.type === "DASHBOARD" ||
            route.type === "USUARIO" ||
            route.type === "CATEGORIA"
        );
        console.log("Perfil LIMITADO: acceso restringido");
      }
    } else {
      // Sin usuario o sin perfil: solo dashboard
      allowedRoutes = ROUTES.filter((route) => route.type === "DASHBOARD");
      console.log("SIN USUARIO: solo dashboard");
    }

    console.log("Rutas permitidas:", allowedRoutes);

    // Agrupar rutas por tipo
    const grouped = new Map<string, RouteInfo[]>();

    for (const route of allowedRoutes) {
      if (!grouped.has(route.type)) {
        grouped.set(route.type, []);
      }
      grouped.get(route.type)?.push(route);
    }

    this.menuItems = Array.from(grouped.values());
    this.useStaticMenus = true;
    console.log("Menús estáticos cargados:", this.menuItems);
  }

  /**
   * Recargar menús (útil para cuando cambie el perfil del usuario)
   */
  reloadMenus(): void {
    this.menuItems = [];
    this.dynamicMenus = [];
    this.loadUserMenus();
  }

  /**
   * Toggle de expansión de menú (igual que en permisos)
   */
  toggleMenuExpanded(menuId: number): void {
    console.log("Toggle menu:", menuId);
    if (this.expandedMenus.has(menuId)) {
      this.expandedMenus.delete(menuId);
      console.log("Menú colapsado:", menuId);
    } else {
      this.expandedMenus.add(menuId);
      console.log("Menú expandido:", menuId);
    }
    console.log("Estado expandedMenus:", this.expandedMenus);
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
}
