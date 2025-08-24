import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipaService } from '../../services/equipa.service';
import { LoginServiceService } from '../../services/login-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Importar FormsModule para ngModel
import { environment } from '../../../environments/environment';
import { UtilizadorParaAtivarData } from '../gestaoutilizador/UtilizadorParaAtivarData';

interface EpocaData {
  id: number;
  epocaDescritivo: string;
}

interface EscalaoData {
  id: number;
  escalaoDescritivo: string;
}

interface EscalaoEpocaData {
  id_escalao_epoca: number;
  descritivo_escalao: string;
}

// Adicione esta interface se não existir em outro lugar
interface UtilizadorData {
  id: number;
  nome: string;
  user: string;
  perfil: string;
  email: string;
  estado: string;
  // Adicione outros campos conforme necessário
}


@Component({
  selector: 'app-administracao',
  standalone: true,
  imports: [CommonModule, FormsModule], // Adicionar FormsModule aqui
  templateUrl: './administracao.component.html',
  styleUrls: ['./administracao.component.css']
})
export class AdministracaoComponent implements OnInit {
  epocaAtual: EpocaData | null = null;
  listaEquipas: EquipaData[] = [];
  loadingEpoca = true;
  loadingEquipas = true;
  errorMessage: string | null = null;
  modoInsercaoEquipa: boolean = false;
  escaloes: EscalaoData[] = [];

  // Novas propriedades para seleção de época
  todasEpocas: EpocaData[] = [];
  epocaSelecionadaId: number | null = null; // Para vincular ao ngModel do select
  escalaoSelecionadaId: number = 0; // Para vincular ao ngModel do select
  textoDescritivoEscalaoSelecionado: string = ""; // Para exibir o texto descritivo do escalão selecionado
  loadingTodasEpocas = true;
  loadingAplicarEpoca = false; // Para o spinner do botão aplicar
  loadingUtilizadores: boolean = false;
  listaUtilizadores: UtilizadorData[] = [];
  utilizadoresWait: UtilizadorParaAtivarData[] = [];

  // Novas propriedades para o modal de reenvio de email
  mostrarModalReenviarEmail: boolean = false;
  mostrarModalLink: boolean = false;
  linkAtivacao: string =  '/#/activeuser?code=';
  emailParaReenviar: string = '';
  utilizadorSelecionadoParaEmail: UtilizadorParaAtivarData | null = null; // Para guardar o objeto completo do utilizador

  constructor(
    private equipaService: EquipaService,
    private loginService: LoginServiceService,
    private router: Router
  ) { }



  
  ngOnInit(): void {
    this.carregarEpocaAtual();
    this.carregarListaEquipas();
    this.carregarTodasEpocas(); // Carregar todas as épocas ao iniciar
    this.carregarListaUtilizadores();
  }

  carregarEpocaAtual(): void {
    this.loadingEpoca = true;
    this.equipaService.getEpocaAtual().subscribe({
      next: (data: EpocaData) => {
        this.epocaAtual = data;
        this.epocaSelecionadaId = data.id; // Define a época atual como selecionada por padrão
        this.loadingEpoca = false;
      },
      error: (err) => {
        console.error('Erro ao carregar época atual:', err);
        this.errorMessage = 'Não foi possível carregar a época atual.';
        this.loadingEpoca = false;
      }
    });
  }

  carregarListaEquipas(): void {
    this.loadingEquipas = true;
    this.equipaService.getEquipasPorEpoca().subscribe({
      next: (data: EquipaData[]) => {
        this.listaEquipas = data;
        this.loadingEquipas = false;
      },
      error: (err) => {
        console.error('Erro ao carregar lista de equipas:', err);
        this.errorMessage = 'Não foi possível carregar a lista de equipas.';
        this.loadingEquipas = false;
      }
    });
  }


  carregarListaUtilizadores(): void {
    this.loadingUtilizadores = true;
    this.loginService.getAllUser().subscribe({
      next: (data: UtilizadorData[]) => {
        this.listaUtilizadores = data;



        this.loginService.getAllUserWait().subscribe({
          next: (data: UtilizadorParaAtivarData[]) => {
            this.utilizadoresWait = data;
            this.loadingUtilizadores = false;


          },
          error: (err) => {
            console.error('Erro ao carregar lista de utilizadores (wait):', err);
            this.errorMessage = 'Não foi possível carregar a lista de utilizadores.';
            this.loadingUtilizadores = false;
          }
        });


      },
      error: (err) => {
        console.error('Erro ao carregar lista de utilizadores:', err);
        this.errorMessage = 'Não foi possível carregar a lista de utilizadores.';
        this.loadingUtilizadores = false;
      }
    });
  }

  copiarLink(): void {
    if (this.linkAtivacao) {
      navigator.clipboard.writeText(this.linkAtivacao)
        .then(() => {
          alert('Link copiado para a área de transferência!');
        })
        .catch(err => {
          console.error('Erro ao copiar o link: ', err);
          alert('Não foi possível copiar o link. Por favor, copie manualmente.');
        });
    }
  }



  carregarTodasEpocas(): void {
    this.loadingTodasEpocas = true;
    this.equipaService.getAllEpocas().subscribe({
      next: (data: EpocaData[]) => {
        this.todasEpocas = data;
        this.loadingTodasEpocas = false;
      },
      error: (err) => {
        console.error('Erro ao carregar todas as épocas:', err);
        this.errorMessage = 'Não foi possível carregar as épocas disponíveis.';
        this.loadingTodasEpocas = false;
      }
    });
  }

  // Novo método para aplicar a época selecionada
  aplicarEpoca(): void {
    if (this.epocaSelecionadaId === null) {
      this.errorMessage = 'Por favor, selecione uma época.';
      return;
    }

    this.loadingAplicarEpoca = true;
    this.errorMessage = null; // Limpa mensagens de erro anteriores

    // Encontra a época selecionada pelo ID
    const epocaParaAplicar = this.todasEpocas.find(e => e.id === this.epocaSelecionadaId);

    if (epocaParaAplicar) {
      // Chama o serviço para "marcar" a nova época como atual
      // Assumindo que você terá um método no EquipaService para isso.
      this.equipaService.setEpocaAtual(epocaParaAplicar.id).subscribe({
        next: () => {
          this.carregarEpocaAtual(); // Recarrega para confirmar a mudança no backend
          this.carregarListaEquipas();
          this.loadingAplicarEpoca = false;
        },
        error: (err) => {
          console.error('Erro ao aplicar época:', err);
          this.errorMessage = 'Não foi possível aplicar a época selecionada.';
          this.loadingAplicarEpoca = false;
        }
      });
    } else {

      this.errorMessage = 'Época selecionada não encontrada.';
      this.loadingAplicarEpoca = false;
    }
  }

  gestaoEquipa(idEquipa: number): void {
    console.log('Gestão da equipa:', idEquipa);
    this.router.navigate(['/gestao-equipa/' + idEquipa]);
  }

  gestaoUtilizador(id: number): void {
    console.log('Gestão do utilizador:', id);
    this.router.navigate(['/gestao-utilizador/' + id]);
  }


  apagarEquipa(idEquipa: number): void {
    if (confirm('Tem a certeza que deseja apagar esta equipa?')) {
      let tmpEscalao: escalao_epoca = {
        id_escalao_epoca: idEquipa,
        descritivo_escalao: ""
      };
      this.equipaService.deleteEscalaoEpoca(tmpEscalao).subscribe({
        next: () => {
          console.log('Equipa apagada com sucesso');
          this.carregarListaEquipas();
        },
        error: (err) => {
          console.error('Erro ao apagar equipa:', err);
          this.errorMessage = 'Não foi possível apagar a equipa.';
        }
      });
    }
  }

  novaequipa(): void {
    console.log('Nova equipa');
    this.modoInsercaoEquipa = true;

    this.equipaService.getAllEscaloes().subscribe({
      next: (data: EscalaoData[]) => {
        this.escaloes = data;
      },
      error: (err) => {
        console.error('Erro ao carregar escalões:', err);
        this.errorMessage = 'Não foi possível carregar os escalões.';
      }
    });

  }


  novoUtilizador(): void {
    this.router.navigate(['/gestao-utilizador/0']);
  }


  onEscalaoChange(): void {
    const escalaoSelecionado = this.escaloes.find(e => e.id === this.escalaoSelecionadaId);
    this.textoDescritivoEscalaoSelecionado = escalaoSelecionado ? escalaoSelecionado.escalaoDescritivo : '';
  }

  adicionar(): void {
    console.log('Adicionar nova equipa');

    let tmpEscalao: escalao_epoca = {
      id_escalao_epoca: this.escalaoSelecionadaId,
      descritivo_escalao: this.textoDescritivoEscalaoSelecionado
    };
    this.equipaService.createEscalaoEpoca(tmpEscalao).subscribe({
      next: () => {
        console.log('Escalão criado com sucesso');
        this.carregarListaEquipas();
        this.escalaoSelecionadaId = 0
        this.textoDescritivoEscalaoSelecionado = "";
      },
      error: (err) => {
        console.error('Erro ao criar escalão:', err);
        this.errorMessage = 'Não foi possível criar o escalão.';
      }
    });

  }

  // Método para abrir o modal de reenvio de email
  abrirModalReenviarEmail(utilizador: UtilizadorParaAtivarData): void {
    this.utilizadorSelecionadoParaEmail = utilizador;
    this.emailParaReenviar = utilizador.email;
    this.mostrarModalReenviarEmail = true;
  }

  // Método para fechar o modal de reenvio de email
  fecharModalReenviarEmail(): void {
    this.mostrarModalReenviarEmail = false;
    this.emailParaReenviar = '';
    this.utilizadorSelecionadoParaEmail = null;
  }


    // Método para obter o endereço base da aplicação
  private getBaseUrl(): string {
    // Obter o URL completo atual
    const fullUrl = window.location.href;
    
    // Extrair apenas a parte base (protocolo + host + porta se existir)
    const url = new URL(fullUrl);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    return baseUrl;
  }


  // Método para abrir o modal de link
  abrirModalLink(utilizador: UtilizadorParaAtivarData): void {
    this.utilizadorSelecionadoParaEmail = utilizador;
    // Construir o link de ativação utilizando o endereço base da aplicação
    const baseUrl = this.getBaseUrl();
    this.linkAtivacao = `${baseUrl}/#/ativeuser?code=${utilizador.code}`;
    this.mostrarModalLink = true;
  }

  // Método para fechar o modal de link
  fecharModalLink(): void {
    this.mostrarModalLink = false;
    this.linkAtivacao = '';
    this.utilizadorSelecionadoParaEmail = null;
  }



  // Método para confirmar o reenvio do email (aqui você chamaria o serviço)
  confirmarReenvioEmail(): void {
    if (this.utilizadorSelecionadoParaEmail) {
      console.log('Reenviar email para:', this.utilizadorSelecionadoParaEmail.email);
      // Chame seu serviço de login para reenviar o email
      // Exemplo:
      this.utilizadorSelecionadoParaEmail.email=this.emailParaReenviar;
      this.loginService.reenviarEmailAtivacao(this.utilizadorSelecionadoParaEmail ).subscribe({
        next: (response) => {
          console.log('Email de ativação reenviado com sucesso:', response);
          alert('Email de ativação reenviado com sucesso!');
          this.fecharModalReenviarEmail();
        },
        error: (error) => {
          console.error('Erro ao reenviar email de ativação:', error);
          alert('Erro ao reenviar email de ativação. Por favor, tente novamente.');
          this.fecharModalReenviarEmail();
        }
      });
    }
  }
}
