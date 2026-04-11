import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { EquipaService } from '../../services/equipa.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClubeData } from '../gestao-clubes/clubesData';
import { ClubeService } from '../../services/clube.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../../../environments/environment';
import { LoginServiceService } from '../../services/login-service.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CompeticaoData } from '../jogo/competicaoData';
import { JogoData, JogadorJogo } from './jogoData';
import { EquipaData } from '../equipa/equipaData';




@Component({
  selector: 'lista-jogos',
  standalone: true,
  imports: [FormsModule, CommonModule, MatCheckboxModule, NgbModule, MatButtonToggleModule],
  templateUrl: './lista-jogos.component.html',
  styleUrl: './lista-jogos.component.css'
})
export class ListaJogosComponent implements OnInit {
  constructor(
    private router: Router,
    private jogoService: JogoService,
    private equipaService: EquipaService,
    private modalService: NgbModal,
    private clubeService: ClubeService,
    private loginService: LoginServiceService
  ) { }

  clubes: ClubeData[] = [];
  clubeCasa: ClubeData | undefined;
  jogos: JogoData[] = [];
  jogosBackup: JogoData[] = [];
  tmpEquipa: EquipaData | undefined;
  loading: boolean = true;
  competicoes: CompeticaoData[] = [];
  novoJogo: JogoData = this.initializeNewJogo();
  isEquipaB_local: boolean = false;
  isEquipaB_adv: boolean = false;
  selectedClube: ClubeData | undefined;
  isAdmin: boolean = false;
  isModoEditar: boolean = false;
  hasEquipaB: boolean = true;
  filtro: string = 'todos';
  competicao_outro_descritivo: string = '';

  // --- Pesquisa de clubes ---
  clubeSearchTerm: string = '';
  clubesFiltrados: ClubeData[] = [];
  showClubeDropdown: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.tmpEquipa = this.equipaService.getEquipa();
    if (this.tmpEquipa === undefined || this.tmpEquipa.id === 0) {
      this.equipaService.getEquipabyIDLight(localStorage.getItem("idequipa_escalao")).subscribe({
        next: (equipa) => {
          this.tmpEquipa = equipa;
          console.log("ListaJogosComponent - ngOnInit - equipa:", this.tmpEquipa?.id);
          this.loadJogos();
          this.loadCompeticoes();
        },
        error: (error) => {
          console.error('Error fetching equipa:', error);
          this.loading = false;
        }
      });
    } else {
      console.log("ListaJogosComponent - ngOnInit - equipa:", this.tmpEquipa?.id);
      this.loadJogos();
      this.loadCompeticoes();
    }

    this.loginService.getLoginData().perfil === 'ADMIN' ? this.isAdmin = true : this.isAdmin = false;
    console.log('ListaJogosComponent | ngOnInit | isAdmin:', this.isAdmin);
  }

  // Fecha o dropdown ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.clube-search-wrapper')) {
      this.showClubeDropdown = false;
    }
  }

  // Filtra a lista de clubes conforme o utilizador escreve
  onClubeSearch(): void {
    const termo = this.clubeSearchTerm.trim().toLowerCase();
    if (termo.length === 0) {
      this.clubesFiltrados = this.clubes.slice(0, 20); // mostra os primeiros 20 por defeito
    } else {
      this.clubesFiltrados = this.clubes
        .filter(c => c.nome.toLowerCase().includes(termo))
        .slice(0, 20);
    }
    this.showClubeDropdown = true;
  }

  // Seleciona um clube da lista
  selecionarClube(clube: ClubeData): void {
    this.selectedClube = clube;
    this.novoJogo.equipa_adv_id = clube.id;
    this.novoJogo.equipa_adv_nome = clube.nome;
    this.clubeSearchTerm = '';
    this.showClubeDropdown = false;
    // Atualiza o local se for fora
    if (this.novoJogo.tipo_local === 'Fora') {
      this.novoJogo.local = clube.pav_nome || '';
    }
  }

  // Limpa o clube selecionado, voltando ao modo de pesquisa
  limparEquipaAdv(): void {
    this.selectedClube = undefined;
    this.novoJogo.equipa_adv_id = 0;
    this.novoJogo.equipa_adv_nome = '';
    this.clubeSearchTerm = '';
    this.clubesFiltrados = this.clubes.slice(0, 20);
    this.showClubeDropdown = false;
  }

  // Limpa apenas o texto de pesquisa
  limparPesquisaClube(): void {
    this.clubeSearchTerm = '';
    this.clubesFiltrados = this.clubes.slice(0, 20);
  }

  private initializeNewJogo(): JogoData {
    return {
      id: 0,
      epoca_id: 0,
      equipa_id: this.tmpEquipa?.id || 0,
      tipoEquipa: '',
      data: new Date(),
      hora: '00:00',
      local: this.clubeCasa?.pav_nome || '',
      golos_equipa: 0,
      equipa_adv_id: 0,
      equipa_adv_nome: '',
      tipoEquipa_adv: '',
      golos_equipa_adv: 0,
      tipo_local: 'Casa',
      competicao_id: 0,
      competicao_nome: '',
      competicao_outro_descritivo: '',
      arbitro_1: 0,
      arbitro_2: 0,
      hora_concentracao: '',
      obs: '',
      estado: 'REGISTADO',
      numeroJogo: '',
      jogadores: []
    };
  }

  private loadJogos() {
    if (this.tmpEquipa && this.tmpEquipa.id !== undefined) {
      this.jogoService.getAllJogosByEquipa(this.tmpEquipa.id).subscribe({
        next: (data) => {
          console.log('ListaJogosComponent | getAllJogosByEquipa | data:', data);
          this.jogos = data;
          this.jogosBackup = data;
          this.hasEquipaB = this.jogos.some(jogo => jogo.tipoEquipa === 'B');
          if (!this.hasEquipaB) {
            this.filtro = 'todos';
          }
          this.filtrarEquipas();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching games:', error);
          this.loading = false;
        }
      });
    } else {
      console.warn('tmpEquipa is undefined or does not have an id.');
      this.loading = false;
    }
  }

  private loadCompeticoes(): void {
    this.jogoService.getAllCompeticoes().subscribe({
      next: (data: CompeticaoData[]) => {
        this.competicoes = data;
      },
      error: (error) => {
        console.error('Erro ao carregar competições:', error);
      }
    });
  }

  private loadClubes(): void {
    this.clubeService.getAllClubes().subscribe({
      next: (data: ClubeData[]) => {
        this.clubes = data;
        // Prepara os primeiros 20 resultados para quando o utilizador abrir o campo
        this.clubesFiltrados = data.slice(0, 20);
      },
      error: (error) => {
        console.error('Erro ao carregar clubes:', error);
      }
    });
  }


  verJogo(parmId: number) {
    this.router.navigate(['jogo/', parmId]);
  }

  adicionarJjogo(content: any) {
    this.getClubeCasa();
    this.loadClubes();
    this.novoJogo = this.initializeNewJogo();
    // Reseta estado de pesquisa
    this.clubeSearchTerm = '';
    this.showClubeDropdown = false;
    this.isEquipaB_local = false;
    this.isEquipaB_adv = false;

    this.equipaService.getEpocaAtual().subscribe(epoca => {
      this.novoJogo.epoca_id = epoca.id;
    });

    console.log('ListaJogosComponent | adicionarJjogo | novoJogo:', this.novoJogo);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'save') {
        this.salvarNovoJogo();
      }
    }, (reason) => {
      // Modal fechado sem salvar
    });
  }

  salvarNovoJogo(): void {
    console.log('Salvando novo jogo:', this.novoJogo);
    if (this.isEquipaB_local) {
      this.novoJogo.tipoEquipa = 'B';
    }
    if (this.isEquipaB_adv) {
      this.novoJogo.tipoEquipa_adv = 'B';
    }

    if (this.novoJogo.competicao_id === 4) {
      this.novoJogo.competicao_nome = this.novoJogo.competicao_outro_descritivo;
    }

    this.jogoService.createJogo(this.novoJogo).subscribe({
      next: (response) => {
        console.log('Jogo criado com sucesso:', response);
        this.loadJogos();
      },
      error: (error) => {
        console.error('Erro ao criar jogo:', error);
        alert('Erro ao criar jogo. Verifique os dados e tente novamente.');
      }
    });
  }

  onCompeticaoChange(competicaoId: number): void {
    const selectedCompeticao = this.competicoes.find(c => c.id === competicaoId);
    if (selectedCompeticao) {
      this.novoJogo.competicao_nome = selectedCompeticao.nome;
    }
  }

  // Mantido por compatibilidade mas o selecionarClube() faz o equivalente
  onEquipaAdversariaChange(equipaAdvId: number): void {
    this.selectedClube = this.clubes.find(c => c.id === equipaAdvId);
    if (this.selectedClube) {
      this.novoJogo.equipa_adv_nome = this.selectedClube.nome;
    }
  }

  onTipoLocal(): void {
    if (this.novoJogo.tipo_local === 'Casa') {
      this.novoJogo.local = this.clubeCasa?.pav_nome || '';
    } else {
      this.novoJogo.local = this.selectedClube?.pav_nome || '';
    }
  }

  filtrarEquipas() {
    this.jogos = this.jogosBackup;
    if (this.filtro === 'todos') {
      this.jogos = this.jogos.filter(jogo => jogo);
    }
    if (this.filtro === 'equipa_a') {
      this.jogos = this.jogos.filter(jogo => jogo.tipoEquipa !== 'B');
    }
    if (this.filtro === 'equipa_b') {
      this.jogos = this.jogos.filter(jogo => jogo.tipoEquipa === 'B');
    }
  }

  getClubeCasa(): void {
    this.clubeService.getClube(environment.clube_id).subscribe({
      next: (clube) => {
        this.clubeCasa = clube;
        if (this.novoJogo.tipo_local === 'Casa') {
          this.novoJogo.local = this.clubeCasa?.pav_nome || '';
        }
      },
      error: (error) => {
        console.error('Error fetching clube:', error);
      }
    });
  }

  editarJogo(jogo: JogoData, content: any) {
    this.isModoEditar = true;
    this.getClubeCasa();
    this.loadClubes();
    this.novoJogo = jogo;
    // Reseta estado de pesquisa e pré-seleciona o clube atual
    this.clubeSearchTerm = '';
    this.showClubeDropdown = false;

    if (this.novoJogo.tipo_local === 'C') {
      this.novoJogo.tipo_local = 'Casa';
    }
    if (this.novoJogo.tipo_local === 'F') {
      this.novoJogo.tipo_local = 'Fora';
    }
    if (this.novoJogo.tipoEquipa === 'B') {
      this.isEquipaB_local = true;
    }
    if (this.novoJogo.tipoEquipa_adv === 'B') {
      this.isEquipaB_adv = true;
    }

    console.log('ListaJogosComponent | editarJogo | novoJogo:', this.novoJogo);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'save') {
        if (this.isModoEditar) {
          this.salvarEdicaoJogo();
        } else {
          this.salvarNovoJogo();
        }
      }
      this.isModoEditar = false;
      this.novoJogo.tipo_local === 'Casa' ? this.novoJogo.tipo_local = 'C' : this.novoJogo.tipo_local = 'F';
    }, (reason) => {
      this.isModoEditar = false;
      this.novoJogo.tipo_local === 'Casa' ? this.novoJogo.tipo_local = 'C' : this.novoJogo.tipo_local = 'F';
    });
  }

  salvarEdicaoJogo(): void {
    console.log('Salvando edição do jogo:', this.novoJogo);

    if (this.isEquipaB_local) {
      this.novoJogo.tipoEquipa = 'B';
    } else {
      this.novoJogo.tipoEquipa = ' ';
    }
    if (this.isEquipaB_adv) {
      this.novoJogo.tipoEquipa_adv = 'B';
    } else {
      this.novoJogo.tipoEquipa_adv = ' ';
    }

    this.novoJogo.tipo_local === 'Casa' ? this.novoJogo.tipo_local = 'C' : this.novoJogo.tipo_local = 'F';

    if (this.novoJogo.competicao_id === 4) {
      this.novoJogo.competicao_nome = this.novoJogo.competicao_outro_descritivo;
    }

    this.jogoService.updateJogo(this.novoJogo).subscribe({
      next: (response) => {
        console.log('Jogo editado com sucesso:', response);
        this.loadJogos();
      },
      error: (error) => {
        console.error('Erro ao editar jogo:', error);
        alert('Erro ao editar jogo. Verifique os dados e tente novamente.');
      }
    });
  }

  apagarJogo(jogo: JogoData) {
    if (confirm(`Tem a certeza que deseja apagar o jogo contra ${jogo.equipa_adv_nome} a ${new Date(jogo.data).toLocaleDateString()}?`)) {
      console.log('Apagando jogo:', jogo);
      this.jogoService.deleteJogo(jogo.id).subscribe({
        next: (response) => {
          console.log('Jogo apagado com sucesso:', response);
          this.loadJogos();
        },
        error: (error) => {
          console.error('Erro ao apagar jogo:', error);
          alert('Erro ao apagar jogo. Tente novamente.');
        }
      });
    }
  }

  verConvocatoria(idJogo: number): void {
    this.router.navigate(['/convocatoria', idJogo]);
  }
}
