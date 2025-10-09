import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Adicionado OnInit
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { EquipaService } from '../../services/equipa.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Importar NgbModal e NgbModule
import { ClubeData } from '../gestao-clubes/clubesData';
import { ClubeService } from '../../services/clube.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../../../environments/environment';
import { LoginServiceService } from '../../services/login-service.service';




@Component({
  selector: 'lista-jogos',
  standalone: true,
  imports: [FormsModule, CommonModule, MatCheckboxModule, NgbModule],
  templateUrl: './lista-jogos.component.html',
  styleUrl: './lista-jogos.component.css'
})
export class ListaJogosComponent implements OnInit { // Implementar OnInit
  constructor(
    private router: Router,
    private jogoService: JogoService,
    private equipaService: EquipaService,
    private modalService: NgbModal, // Injetar NgbModal
    private clubeService: ClubeService,
    private loginService: LoginServiceService

  ) { }

  clubes: ClubeData[] = []; // Para popular o dropdown de clubes
  clubeCasa: ClubeData | undefined; // Clube da casa
  jogos: JogoData[] = [];
  tmpEquipa: EquipaData | undefined;
  loading: boolean = true; // Adicionar propriedade de loading
  competicoes: CompeticaoData[] = []; // Para popular o dropdown de competições
  novoJogo: JogoData = this.initializeNewJogo(); // Objeto para o novo jogo no modal
  isEquipaB_local: boolean = false; // Para o checkbox de Equipa B
  isEquipaB_adv: boolean = false; // Para o checkbox de Equipa B
  selectedClube: ClubeData | undefined;
  isAdmin: boolean = false; // Para verificar se o utilizador é admin
  isModoEditar: boolean = false; // Para verificar se está em modo editar
  hasEquipaB:boolean = true;

  ngOnInit(): void {
    this.loading = true; // Inicia o loading
    this.tmpEquipa = this.equipaService.getEquipa();
    if (this.tmpEquipa === undefined || this.tmpEquipa.id === 0) { // Verifica se a equipa não está carregada
      this.equipaService.getEquipabyIDLight(localStorage.getItem("idequipa_escalao")).subscribe({
        next: (equipa) => {
          this.tmpEquipa = equipa;
          console.log("ListaJogosComponent - ngOnInit - equipa:", this.tmpEquipa?.id);
          this.loadJogos();
          this.loadCompeticoes(); // Carregar competições
        },
        error: (error) => {
          console.error('Error fetching equipa:', error);
          this.loading = false; // Finaliza o loading em caso de erro
        }
      });
    } else {
      console.log("ListaJogosComponent - ngOnInit - equipa:", this.tmpEquipa?.id);
      this.loadJogos();
      this.loadCompeticoes(); // Carregar competições

    }

    // Verifica se o utilizador é admin
    this.loginService.getLoginData().perfil === 'ADMIN' ? this.isAdmin = true : this.isAdmin = false;
    console.log('ListaJogosComponent | ngOnInit | isAdmin:', this.isAdmin);

  }

  // Método para inicializar um novo objeto JogoData
  private initializeNewJogo(): JogoData {
    return {
      id: 0,
      epoca_id: 0, // Será preenchido com a época atual
      equipa_id: this.tmpEquipa?.id || 0, // ID da equipa atual
      tipoEquipa: this.tmpEquipa?.escalao || '', // Escalão da equipa atual
      data: new Date(),
      hora: '00:00',
      local: this.clubeCasa?.pav_nome || '', // Endereço do clube da casa
      golos_equipa: 0,
      equipa_adv_id: 0, // Será selecionado
      equipa_adv_nome: '', // Será preenchido
      tipoEquipa_adv: '', // Será preenchido
      golos_equipa_adv: 0,
      tipo_local: 'Casa', // Padrão
      competicao_id: 0, // Será selecionado
      competicao_nome: '', // Será preenchido
      arbitro_1: 0,
      arbitro_2: 0,
      estado: 'REGISTADO', // Padrão
      jogadores: [] // Inicialmente vazio
    };
  }

  private loadJogos() {
    if (this.tmpEquipa && this.tmpEquipa.id !== undefined) {
      this.jogoService.getAllJogosByEquipa(this.tmpEquipa.id).subscribe({
        next: (data) => {
          console.log('ListaJogosComponent | getAllJogosByEquipa | data:', data);
          this.jogos = data;
          this.loading = false; // Finaliza o loading
        },
        error: (error) => {
          console.error('Error fetching games:', error);
          this.loading = false; // Finaliza o loading em caso de erro
        }
      });
    } else {
      console.warn('tmpEquipa is undefined or does not have an id.');
      this.loading = false; // Finaliza o loading
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
      },
      error: (error) => {
        console.error('Erro ao carregar clubes:', error);
      }
    });
  }


  verJogo(parmId: number) {
    this.router.navigate(['jogo/', parmId]);
  }

  // Método para abrir o modal de adicionar jogo
  adicionarJjogo(content: any) {
    this.getClubeCasa(); // Carregar clube da casa
    this.loadClubes(); // Carregar clubes para o dropdown
    this.novoJogo = this.initializeNewJogo(); // Reinicia o objeto para um novo jogo
    // Preenche a época atual
    this.equipaService.getEpocaAtual().subscribe(epoca => {
      this.novoJogo.epoca_id = epoca.id;
    });

    console.log('ListaJogosComponent | adicionarJjogo | novoJogo:', this.novoJogo);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'save') {
        this.salvarNovoJogo();
      }
    }, (reason) => {
      // Modal fechado sem salvar (cancelar, esc, clique fora)
    });
  }

  // Método para salvar o novo jogo
  salvarNovoJogo(): void {
    // Lógica para salvar o novo jogo via serviço
    console.log('Salvando novo jogo:', this.novoJogo);
    // Aqui você chamaria o serviço para enviar this.novoJogo para o backend
    if (this.isEquipaB_local) {
      this.novoJogo.tipoEquipa = 'B';
    }
    if (this.isEquipaB_adv) {
      this.novoJogo.tipoEquipa_adv = 'B';
    }

    this.jogoService.createJogo(this.novoJogo).subscribe({
      next: (response) => {
        console.log('Jogo criado com sucesso:', response);
        this.loadJogos(); // Recarrega a lista de jogos
      },
      error: (error) => {
        console.error('Erro ao criar jogo:', error);
        alert('Erro ao criar jogo. Verifique os dados e tente novamente.');
      }
    });
  }

  // Método para lidar com a seleção da competição no modal
  onCompeticaoChange(competicaoId: number): void {
    const selectedCompeticao = this.competicoes.find(c => c.id === competicaoId);
    if (selectedCompeticao) {
      this.novoJogo.competicao_nome = selectedCompeticao.nome;
    }
  }



  // Método para lidar com a seleção da equipa adversária (se tiver uma lista de clubes)
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


  // carrega clube da casa
  getClubeCasa(): void {
    this.clubeService.getClube(environment.clube_id).subscribe({
      next: (clube) => {
        // handle clube data here, e.g., assign to a property
        this.clubeCasa = clube;
        this.novoJogo.local = this.clubeCasa?.pav_nome || '';
      },
      error: (error) => {
        console.error('Error fetching clube:', error);
        // handle error case here
      }
    });
  }

  editarJogo(jogo: JogoData, content: any) {
    this.isModoEditar = true;
    this.getClubeCasa(); // Carregar clube da casa
    this.loadClubes(); // Carregar clubes para o dropdown
    this.novoJogo = jogo
    if (this.novoJogo.tipo_local === 'C') {
      this.novoJogo.tipo_local = 'Casa'
    }
    if (this.novoJogo.tipo_local === 'F') {
      this.novoJogo.tipo_local = 'Fora'
    }
    if(this.novoJogo.tipoEquipa==='B'){
      this.isEquipaB_local = true;
    }
    if(this.novoJogo.tipoEquipa_adv==='B'){
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
      this.isModoEditar = false
       this.novoJogo.tipo_local === 'Casa' ? this.novoJogo.tipo_local = 'C' : this.novoJogo.tipo_local = 'F';
    }, (reason) => {
      // Modal fechado sem salvar (cancelar, esc, clique fora)
      this.isModoEditar = false
       this.novoJogo.tipo_local === 'Casa' ? this.novoJogo.tipo_local = 'C' : this.novoJogo.tipo_local = 'F';
    });

  }

  salvarEdicaoJogo(): void {
    // Lógica para salvar o novo jogo via serviço
    console.log('Salvando edição do jogo:', this.novoJogo);

    if (this.isEquipaB_local) {
      this.novoJogo.tipoEquipa = 'B';
    }else{
      this.novoJogo.tipoEquipa = ' ';
    }
    if (this.isEquipaB_adv) {
      this.novoJogo.tipoEquipa_adv = 'B';
    }else{
      this.novoJogo.tipoEquipa_adv = ' ';
    }

    this.novoJogo.tipo_local === 'Casa' ? this.novoJogo.tipo_local = 'C' : this.novoJogo.tipo_local = 'F';

    this.jogoService.updateJogo(this.novoJogo).subscribe({
      next: (response) => {
        console.log('Jogo editado com sucesso:', response);
        this.loadJogos(); // Recarrega a lista de jogos
      },
      error: (error) => {
        console.error('Erro ao editar jogo:', error);
        alert('Erro ao editar jogo. Verifique os dados e tente novamente.');
      }
    });


  }

  apagarJogo(jogo: JogoData) {
    if (confirm(`Tem a certeza que deseja apagar o jogo contra ${jogo.equipa_adv_nome} a ${new Date(jogo.data).toLocaleDateString()}?`)) {
      // Lógica para apagar o jogo via serviço
      console.log('Apagando jogo:', jogo);
      this.jogoService.deleteJogo(jogo.id).subscribe({
        next: (response) => {
          console.log('Jogo apagado com sucesso:', response);
          this.loadJogos(); // Recarrega a lista de jogos
        },
        error: (error) => {
          console.error('Erro ao apagar jogo:', error);
          alert('Erro ao apagar jogo. Tente novamente.');
        }
      });
      // Aqui você chamaria o serviço para apagar o jogo no backend
    }
  }

    // Novo método para navegar para a convocatória
  verConvocatoria(idJogo: number): void {
    this.router.navigate(['/convocatoria', idJogo]);
  }


}
