import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginServiceService } from '../services/login-service.service';
import { Router } from '@angular/router';
import { ClubConfigService } from '../services/club-config.service';
import { EquipaService } from '../services/equipa.service';
import { PerformanceConfigService } from '../services/performance-config.service';
import { Subscription } from 'rxjs';

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

export class SidebarComponent implements OnInit, OnDestroy {
  public menuItems: any[] = [];
  public logoPath: string = ''; // Adicione esta propriedade
  public titleText: string = 'HC Maia'; // Nova propriedade para controlar o texto
  private tmpUser: string = '';
  private perfConfigSub?: Subscription;

  historicologinsMenu: RouteInfo = { path: '/historicologins', title: 'Historico_Logins', icon: 'nc-bullet-list-67', class: '' };
  jogosMenu: RouteInfo = { path: '/listajogos', title: 'Jogos', icon: 'nc-minimal-right', class: '' };
  adminMenu: RouteInfo = { path: '/administracao', title: 'Administração', icon: 'nc-settings', class: '' };
  gestaoClubesMenu: RouteInfo = { path: '/gestao-clubes', title: 'Clubes', icon: 'nc-html5', class: '' };
  performanceMenu: RouteInfo = { path: '/performance', title: 'Performance', icon: 'nc-favourite-28', class: '' };
  sairMenu: RouteInfo = { path: '/', title: 'Sair', icon: 'nc-key-25', class: 'active-pro' };




  constructor(private loginws: LoginServiceService, private router: Router, private clubConfigService: ClubConfigService,
    private equipaService: EquipaService, private perfConfigService: PerformanceConfigService) { }
  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.tmpUser = this.loginws.getLoginData().user;
    console.log('Utilizador atual no sidebar:', this.tmpUser);
    console.log('Perfil do utilizador:', this.loginws.getLoginData().perfil);

    
    if (this.loginws.getLoginData().perfil == "ADMIN" || this.loginws.getLoginData().perfil == "TREINADOR") {
      this.addPerformanceMenu();
    }

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

    // Sincroniza o item "Performance" com a configuração da equipa atual
    this.perfConfigSub = this.perfConfigService.config$.subscribe(() => this.syncPerformanceMenu());
    const idEquipaAtual = this.equipaService.getEquipa()?.id
      ?? Number(localStorage.getItem('idequipa_escalao') ?? 0);
    if (idEquipaAtual > 0) {
      this.perfConfigService.carregarConfig(idEquipaAtual);
    }
  }

  ngOnDestroy(): void {
    this.perfConfigSub?.unsubscribe();
  }

  /** Adiciona o item do menu Performance (apenas se permitido por perfil). */
  private addPerformanceMenu(): void {
    const perfil = this.loginws.getLoginData().perfil;
    if (perfil !== 'ADMIN' && perfil !== 'TREINADOR') { return; }
    if (!this.menuItems.some(item => item.title === this.performanceMenu.title)) {
      this.menuItems.push(this.performanceMenu);
    }
  }

  /**
   * Mantém o item "Performance" alinhado com a configuração da equipa:
   * quando a funcionalidade de performance está desativada, o item é removido
   * (é como se não existisse).
   */
  private syncPerformanceMenu(): void {
    const perfAtiva = this.perfConfigService.performanceAtiva;
    const idx = this.menuItems.findIndex(item => item.title === this.performanceMenu.title);
    if (perfAtiva) {
      this.addPerformanceMenu();
    } else if (idx !== -1) {
      this.menuItems.splice(idx, 1);
    }
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
