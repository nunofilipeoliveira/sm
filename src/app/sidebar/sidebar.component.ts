import { Component, OnInit } from '@angular/core';
import { LoginServiceService } from '../services/login-service.service';
import { Router } from '@angular/router';
import { ClubConfigService } from '../services/club-config.service';

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
  { path: '/listajogos', title: 'Jogos', icon: 'nc-minimal-right', class: '' },
  { path: '/estatisticas', title: 'Estatísticas', icon: 'nc-chart-bar-32', class: '' },
  { path: '/gestao-clubes', title: 'Clubes', icon: 'nc-html5', class: '' },

];




@Component({
  selector: 'sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
  public menuItems: any[] = [];
  public logoPath: string = ''; // Adicione esta propriedade
  public titleText: string = 'HC Maia'; // Nova propriedade para controlar o texto
  private tmpUser: string = '';

  historicologinsMenu: RouteInfo = { path: '/historicologins', title: 'Historico_Logins', icon: 'nc-bullet-list-67', class: '' };
  jogosMenu: RouteInfo = { path: '/listajogos', title: 'Jogos', icon: 'nc-minimal-right', class: '' };
  adminMenu: RouteInfo = { path: '/administracao', title: 'Administração', icon: 'nc-settings', class: '' };
  gestaoClubesMenu: RouteInfo = { path: '/gestao-clubes', title: 'Clubes', icon: 'nc-html5', class: '' };
  sairMenu: RouteInfo = { path: '/', title: 'Sair', icon: 'nc-key-25', class: 'active-pro' };




  constructor(private loginws: LoginServiceService, private router: Router, private clubConfigService: ClubConfigService) { }
  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.tmpUser = this.loginws.getLoginData().user;
    console.log('Utilizador atual no sidebar:', this.tmpUser);
    console.log('Perfil do utilizador:', this.loginws.getLoginData().perfil);


    if (this.tmpUser == "Nuno") {
      this.menuItems.push(this.historicologinsMenu)

    }

    if (this.loginws.getLoginData().perfil == "ADMIN") {
      this.menuItems.push(this.adminMenu)
    }

    this.menuItems.push(this.sairMenu);

    // Obtém a configuração do clube atual
    const clubConfig = this.clubConfigService.getCurrentClubConfig();
    this.logoPath = clubConfig.logoPath;
    this.titleText = clubConfig.name;

  }

  ngDoCheck() {

    console.log('SideBar | Verificação do menu para o utilizador: ', this.loginws.getLoginData().user);
    const user = this.loginws.getLoginData().user;
    console.log('SideBar | Utilizador atual no ngDoCheck:', user);

    // Verifica se o utilizador é "Nuno"
    if (user == "Nuno") {
      // Cria um array com os títulos dos menus que Nuno deve ter
      const requiredMenus = [this.historicologinsMenu.title];

      // Cria um array com os títulos dos menus atualmente disponíveis
      const currentMenuTitles = this.menuItems.map(item => item.title);

      // Verifica se todos os menus requeridos estão presentes
      const allMenusPresent = requiredMenus.every(menu => currentMenuTitles.includes(menu));

      // Se algum menu estiver faltando, adiciona-o
      if (!allMenusPresent) {
        this.menuItems = [...this.menuItems, this.historicologinsMenu];
      }

      if (this.menuItems[this.menuItems.length - 1]?.title !== 'Sair') {
        this.menuItems = this.menuItems.filter(item => item.title !== 'Sair');
        this.menuItems.push(this.sairMenu);
      }
    }




    if (this.loginws.getLoginData().perfil == "ADMIN") {
      // Cria um array com os títulos dos menus que Nuno deve ter
      const requiredMenus = [this.adminMenu.title];

      // Cria um array com os títulos dos menus atualmente disponíveis
      const currentMenuTitles = this.menuItems.map(item => item.title);

      // Verifica se todos os menus requeridos estão presentes
      const allMenusPresent = requiredMenus.every(menu => currentMenuTitles.includes(menu));

      // Se algum menu estiver faltando, adiciona-o
      if (!allMenusPresent) {
        this.menuItems.push(this.adminMenu);
      }

      if (this.menuItems[this.menuItems.length - 1]?.title !== 'Sair') {
        this.menuItems = this.menuItems.filter(item => item.title !== 'Sair');
        this.menuItems.push(this.sairMenu);
      }
    }



    console.log('SideBar | Menu Items atuais:', this.menuItems);
  }

  logout() {
    console.log('SidebarComponent | logout | clearing all session data');
    this.loginws.clear();
  }



}
