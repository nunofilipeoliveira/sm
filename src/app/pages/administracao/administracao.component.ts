import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipaService } from '../../services/equipa.service';
import { LoginServiceService } from '../../services/login-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Importar FormsModule para ngModel

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

  constructor(
    private equipaService: EquipaService,
    private loginService: LoginServiceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarEpocaAtual();
    this.carregarListaEquipas();
    this.carregarTodasEpocas(); // Carregar todas as épocas ao iniciar
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
}
