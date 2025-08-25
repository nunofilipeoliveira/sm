import { Component, OnInit } from '@angular/core';
import { LoginServiceService } from '../services/login-service.service';
import { environment } from '../../environments/environment';

export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

export const ROUTES: RouteInfo[] = [
   { path: '/dashboard', title: 'Dashboard', icon: 'nc-chart-pie-36', class: '' },
  { path: '/equipa', title: 'Equipa', icon: 'nc-badge', class: '' },
  { path: '/mpresenca', title: 'Marcar Presença', icon: 'nc-tap-01', class: '' },
  { path: '/presencas', title: 'Presenças', icon: 'nc-paper', class: '' },
  //{ path: '/administracao', title: 'Administração', icon: 'nc-settings', class: '' }, // Nova entrada para administração
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
  public logoPath: string = ''; // Adicione esta propriedade
  public titleText: string = 'HC Maia'; // Nova propriedade para controlar o texto

  historicologinsMenu: RouteInfo = { path: '/historicologins', title: 'Historico_Logins', icon: 'nc-bullet-list-67', class: '' };
  jogosMenu: RouteInfo = { path: '/listajogos', title: 'Jogos', icon: 'nc-minimal-right', class: '' };
  adminMenu: RouteInfo = { path: '/administracao', title: 'Administração', icon: 'nc-settings', class: '' };


  constructor(private loginws: LoginServiceService) { }
  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);


    if (this.loginws.getLoginData().user == "Nuno") {
      this.menuItems.push(this.historicologinsMenu)
      this.menuItems.push(this.jogosMenu)
      this.menuItems.push(this.adminMenu)
    }

    // Defina o caminho da imagem aqui, pode ser condicional ou vir de um serviço
    if (environment.tenant_id === 1) {
      this.logoPath = 'assets/img/hcMaia_logo.png'; // Caminho para o logo do HC Maia
      this.titleText = 'HC Maia'; // Texto do título para HC Maia
    } else if (environment.tenant_id === 2) {
      this.logoPath = 'assets/img/ADValongo_logo.png'; // Caminho para o logo do AD Valongo
      this.titleText = 'AD Valongo'; // Texto do título para AD Valongo
    } else {
      this.logoPath = 'assets/img/default_logo.png'; // Logo padrão se necessário
    }

  }

  ngDoCheck() {
    const user = this.loginws.getLoginData().user;

    // Verifica se o utilizador é "Nuno"
    if (user === "Nuno") {
      // Cria um array com os títulos dos menus que Nuno deve ter
      const requiredMenus = [this.historicologinsMenu.title, this.jogosMenu.title, this.adminMenu.title];

      // Cria um array com os títulos dos menus atualmente disponíveis
      const currentMenuTitles = this.menuItems.map(item => item.title);

      // Verifica se todos os menus requeridos estão presentes
      const allMenusPresent = requiredMenus.every(menu => currentMenuTitles.includes(menu));

      // Se algum menu estiver faltando, adiciona-o
      if (!allMenusPresent) {
        this.menuItems = [...this.menuItems, this.historicologinsMenu, this.jogosMenu, this.adminMenu];
      }
    }
  }



}
