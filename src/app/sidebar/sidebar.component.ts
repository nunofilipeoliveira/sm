import { Component, OnInit } from '@angular/core';
import { LoginServiceService } from '../services/login-service.service';

export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

export const ROUTES: RouteInfo[] = [
  { path: '/equipa', title: 'Equipa', icon: 'nc-badge', class: '' },
  { path: '/mpresenca', title: 'Marcar Presença', icon: 'nc-tap-01', class: '' },
  { path: '/presencas', title: 'Presenças', icon: 'nc-minimal-right', class: '' },
  //{ path: '/listajogos', title: 'Jogos', icon: 'nc-minimal-right', class: '' },
  { path: '/', title: 'Sair', icon: 'nc-key-25', class: 'active-pro' },
  //{ path: '/notifications', title: 'Experiência -2-',   icon:'nc-minimal-right',    class: '' },
  //{ path: '/user',          title: 'Experiência -3-',   icon:'nc-minimal-right',  class: '' },
  //{ path: '/table',         title: 'Experiência -4-',   icon:'nc-minimal-right',    class: '' },
  //{ path: '/typography',    title: 'Experiência -5-',   icon:'nc-minimal-right', class: '' },

];



@Component({
  selector: 'sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
  public menuItems: any[] = [];
  constructor(private loginws: LoginServiceService) { }
  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);

    let adminMenu: RouteInfo = { path: '/historicologins', title: 'Historico_Logins', icon: 'nc-bullet-list-67', class: '' };
    let jogosMenu: RouteInfo = { path: '/listajogos', title: 'Jogos', icon: 'nc-minimal-right', class: '' };
    if (this.loginws.getLoginData().user == "Nuno") {
      this.menuItems.push(adminMenu)
      this.menuItems.push(jogosMenu)
    }


  }
}
