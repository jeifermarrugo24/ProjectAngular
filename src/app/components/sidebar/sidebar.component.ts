import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    type: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard', type: 'DASHBOARD',  icon: 'dashboard', class: '' },
    { path: '/users', title: 'Registrar usuarios', type: 'USUARIO',  icon:'person', class: '' },
    { path: '/users', title: 'Listado de usuarios', type: 'USUARIO', icon:'content_paste', class: '' },
    { path: '/categories', title: 'Registrar Categorias', type: 'CATEGORIA', icon:'playlist_add', class: '' },
    { path: '/categories', title: 'Listado de usuarios', type: 'CATEGORIA', icon:'content_paste', class: '' },
    { path: '/subcategories', title: 'Registrar subcategoria', type: 'SUBCATEGORIA', icon:'playlist_add', class: '' },
    { path: '/subcategories', title: 'Listado de subcategoria', type: 'SUBCATEGORIA', icon:'content_paste', class: '' },
    { path: '/productos', title: 'Registrar productos', type: 'PRODUCTOS', icon:'playlist_add', class: '' },
    { path: '/productos', title: 'Listado de productos', type: 'PRODUCTOS', icon:'content_paste', class: '' },
    { path: '/menus', title: 'Registrar Menu', type: 'MENU', icon:'playlist_add', class: '' },
    { path: '/menus', title: 'Listado de Menus', type: 'MENU', icon:'content_paste', class: '' },
    { path: '/roles', title: 'Registrar roles', type: 'ROLES', icon:'playlist_add', class: '' },
    { path: '/roles', title: 'Listado de roles', type: 'ROLES', icon:'content_paste', class: '' },
    { path: '/permisos', title: 'Registrar permisos por roles', type: 'PERMISOS', icon:'playlist_add', class: '' },
    
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
  const grouped = new Map<string, any[]>();

  for (const item of ROUTES) {
    if (!grouped.has(item.type)) {
      grouped.set(item.type, []);
    }
    grouped.get(item.type)?.push(item);
  }

  this.menuItems = Array.from(grouped.values());
}

  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
