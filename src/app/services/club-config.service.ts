import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ClubConfig {
  tenantId: number;
  name: string;
  logoPath: string;
  root: string;
  // Cores do login
  loginBackgroundColor: string;
  loginGradientStart: string;
  loginGradientEnd: string;
  loginButtonColor: string;
  loginButtonHoverColor: string;
  loginInputPlaceholderColor: string;
  // Imagem de fundo do login
  loginBackgroundImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClubConfigService {

  private clubConfigs: ClubConfig[] = [
    {
      tenantId: 1,
      name: 'HC Maia',
      logoPath: 'assets/img/hcMaia_logo.png',
      root: '',
      // Cores do login HC Maia
      loginBackgroundColor: '#f3f3f3',
      loginGradientStart: '#273890',
      loginGradientEnd: '#b52732',
      loginButtonColor: '#273890',
      loginButtonHoverColor: '#b52732',
      loginInputPlaceholderColor: '#273890',
      // Imagem de fundo do login HC Maia
      loginBackgroundImage: 'assets/img/MaiaFundo.png'
    },
    {
      tenantId: 2,
      name: 'AD Valongo',
      logoPath: 'assets/img/ADValongo_logo.png',
      root: 'advalongo',
      // Cores do login AD Valongo
      loginBackgroundColor: '#f3f3f3',
      loginGradientStart: '#008B6C',
      loginGradientEnd: '#003D2F',
      loginButtonColor: '#008B6C',
      loginButtonHoverColor: '#003D2F',
      loginInputPlaceholderColor: '#008B6C',
      // Imagem de fundo do login AD Valongo
      loginBackgroundImage: 'assets/img/ADValongo_fundo.png'
    },
    {
      tenantId: 3,
      name: 'CIS',
      logoPath: 'assets/img/CIS_logo.png',
      root: 'cis',
      // Cores do login CIS
      loginBackgroundColor: '#f3f3f3',
      loginGradientStart: '#ffffff',
      loginGradientEnd: '#b52732',
      loginButtonColor: '#273890',
      loginButtonHoverColor: '#b52732',
      loginInputPlaceholderColor: '#273890',
      // Imagem de fundo do login CIS
      loginBackgroundImage: 'assets/img/cis_fundo.png'
    },
    {
      tenantId: 4,
      name: 'Super Patins',
      logoPath: 'assets/img/SuperPatins_logo.png',
      root: 'superpatins',
      // Cores do login Super Patins
      loginBackgroundColor: '#f3f3f3',
      loginGradientStart: '#2c6aef',
      loginGradientEnd: '#f9f905',
      loginButtonColor: '#2c6aef',
      loginButtonHoverColor: '#f9f905',
      loginInputPlaceholderColor: '#2c6aef',
      // Imagem de fundo do login Super Patins
      loginBackgroundImage: 'assets/img/SuperPatins_logo.png'
    }
  ];

  constructor() { }

  /**
   * Obtém a configuração do clube atual baseado no tenant_id do environment
   */
  getCurrentClubConfig(): ClubConfig {
    const tenantId = environment.tenant_id;
    const config = this.clubConfigs.find(club => club.tenantId === tenantId);
    
    if (!config) {
      console.warn(`ClubConfigService | Configuração não encontrada para tenant_id: ${tenantId}. Usando configuração padrão.`);
      return {
        tenantId: tenantId,
        name: 'Clube',
        logoPath: 'assets/img/default_logo.png',
        root: '',
        loginBackgroundColor: '#f3f3f3',
        loginGradientStart: '#273890',
        loginGradientEnd: '#b52732',
        loginButtonColor: '#273890',
        loginButtonHoverColor: '#b52732',
        loginInputPlaceholderColor: '#273890',
        loginBackgroundImage: 'assets/img/MaiaFundo.png'
      };
    }
    
    return config;
  }

  /**
   * Obtém uma configuração de clube por tenant_id
   */
  getClubConfigByTenantId(tenantId: number): ClubConfig | undefined {
    return this.clubConfigs.find(club => club.tenantId === tenantId);
  }

  /**
   * Obtém o nome do clube atual
   */
  getCurrentClubName(): string {
    return this.getCurrentClubConfig().name;
  }

  /**
   * Obtém o caminho do logo do clube atual
   */
  getCurrentClubLogo(): string {
    return this.getCurrentClubConfig().logoPath;
  }

  /**
   * Obtém o root do clube atual
   */
  getCurrentClubRoot(): string {
    return this.getCurrentClubConfig().root;
  }

  /**
   * Obtém a cor de fundo do login do clube atual
   */
  getCurrentLoginBackgroundColor(): string {
    return this.getCurrentClubConfig().loginBackgroundColor;
  }

  /**
   * Obtém o gradiente de fundo do login do clube atual
   */
  getCurrentLoginGradient(): string {
    const config = this.getCurrentClubConfig();
    return `linear-gradient(to bottom, ${config.loginGradientStart}, ${config.loginGradientEnd})`;
  }

  /**
   * Obtém a cor do botão do login do clube atual
   */
  getCurrentLoginButtonColor(): string {
    return this.getCurrentClubConfig().loginButtonColor;
  }

  /**
   * Obtém a cor do hover do botão do login do clube atual
   */
  getCurrentLoginButtonHoverColor(): string {
    return this.getCurrentClubConfig().loginButtonHoverColor;
  }

  /**
   * Obtém a cor do placeholder dos inputs do login do clube atual
   */
  getCurrentLoginInputPlaceholderColor(): string {
    return this.getCurrentClubConfig().loginInputPlaceholderColor;
  }

  /**
   * Obtém a imagem de fundo do login do clube atual
   */
  getCurrentLoginBackgroundImage(): string {
    return this.getCurrentClubConfig().loginBackgroundImage;
  }

  /**
   * Adiciona uma nova configuração de clube (para uso futuro quando criar novos clubes)
   */
  addClubConfig(config: ClubConfig): void {
    const existingIndex = this.clubConfigs.findIndex(club => club.tenantId === config.tenantId);
    
    if (existingIndex >= 0) {
      console.warn(`ClubConfigService | Atualizando configuração existente para tenant_id: ${config.tenantId}`);
      this.clubConfigs[existingIndex] = config;
    } else {
      console.log(`ClubConfigService | Adicionando nova configuração para tenant_id: ${config.tenantId}`);
      this.clubConfigs.push(config);
    }
  }

  /**
   * Lista todas as configurações de clubes
   */
  getAllClubConfigs(): ClubConfig[] {
    return [...this.clubConfigs];
  }
}