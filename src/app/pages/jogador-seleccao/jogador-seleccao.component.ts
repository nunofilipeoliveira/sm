import { PresencaService } from './../../services/presenca.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipaService } from '../../services/equipa.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroJogadorPipe } from './filtroJogador.pipe';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { cp } from 'fs';




@Component({
  selector: 'jogador-seleccao',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroJogadorPipe],
  templateUrl: './jogador-seleccao.component.html',
  styleUrl: './jogador-seleccao.component.css'
})
export class JogadorSeleccaoComponent implements OnInit {

  public spinner: boolean = false;
  public idEscalao: number = 0;
  public jogadores: JogadorSeleccao[] = [];
  public filtro_nome: string = "";
  public filtro_visivel: boolean = false;
  public origem_gestao_equipa: boolean = false;
  public filtro_equipa: string = "todas";
  public escaloesDisponiveis: string[] = [];
  idjogo: number = 0;
  public jogadoresSelecionados: number[] = [];

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private presencaService: PresencaService, private router: Router, public activeModal: NgbActiveModal) { }




  ngOnInit() {
    this.spinner = true;
    console.log('JogadorSeleccaoComponent | ngOnInit - origem_gestao_equipa inicial:', this.origem_gestao_equipa);

    // Verificar se foi passado via modal
    if (this.origem_gestao_equipa === true) {
      console.log('JogadorSeleccaoComponent | origem_gestao_equipa já definido como true via modal');
    }

    const routeParams = this.route.snapshot.paramMap;
    this.idEscalao = Number(routeParams.get('id'));
    this.idjogo = Number(routeParams.get('idjogo'));
    console.log('JogadorSeleccaoComponent | idjogo:', this.idjogo);

    console.log('JogadorSeleccaoComponent | idEscalao:', this.idEscalao);
    if (this.idEscalao < 0) {
      console.log("JogadorSeleccaoComponent | Modo seleção jogador genérico");
      this.origem_gestao_equipa = true;
      this.idEscalao = this.idEscalao * -1;
      let nomeJogador = String(routeParams.get('nomeJogador'));
      console.log('JogadorSeleccaoComponent | idEscalao:', this.idEscalao);
      console.log('JogadorSeleccaoComponent | nomeJogador:', nomeJogador);
      if (nomeJogador != "null") {
        console.log("JogadorSeleccaoComponent | Modo nomeJogador");
        this.filtro_nome = nomeJogador
      }

    } else {
      console.log("JogadorSeleccaoComponent | Modo seleção jogador origem marcação presença");
      // Só definir como false se não foi definido como true via modal
      if (this.origem_gestao_equipa !== true) {
        this.origem_gestao_equipa = false;
      }
    }

    console.log('JogadorSeleccaoComponent | ngOnInit - origem_gestao_equipa final:', this.origem_gestao_equipa);

    let modoObterJogadores = '0';
    if (this.origem_gestao_equipa == true) {
      modoObterJogadores = '1';
    }

    this.equipaService.getJogadoresDisponiveis(this.idEscalao, modoObterJogadores).subscribe(
      {
        next: data => {
          this.jogadores = data;
          console.log("JogadorSeleccaoComponent | jogadores disponiveis", this.jogadores);
          this.spinner = false;
          if (data != null) {
            // Generate unique escaloes from the players data
            this.escaloesDisponiveis = [...new Set((data as JogadorSeleccao[]).map(j => j.escalao))].sort();
            console.log("JogadorSeleccaoComponent | escaloes disponiveis", this.escaloesDisponiveis);
          } else {

          }
        },
        error: error => {
          console.log("FichaJogadorComponent | Serviço gravarFichaJogador Erro!!");

        }
      });

  }

  seleciona(indice_jogador: number) {
    console.log("JogadorSeleccaoComponent | Toggle seleção");
    console.log("JogadorSeleccaoComponent | Seleciona | indice:", indice_jogador);

    // Toggle selection - only add/remove from selection array
    const index = this.jogadoresSelecionados.indexOf(indice_jogador);
    if (index > -1) {
      this.jogadoresSelecionados.splice(index, 1);
      console.log("JogadorSeleccaoComponent | Jogador removido da seleção");
    } else {
      this.jogadoresSelecionados.push(indice_jogador);
      console.log("JogadorSeleccaoComponent | Jogador adicionado à seleção");
    }

    console.log("JogadorSeleccaoComponent | Jogadores selecionados:", this.jogadoresSelecionados);
  }

  confirmarSelecao() {
    console.log("JogadorSeleccaoComponent | Confirmar seleção múltipla");
    console.log("JogadorSeleccaoComponent | origem_gestao_equipa:", this.origem_gestao_equipa);
    if (this.jogadoresSelecionados.length === 0) {
      alert('Selecione pelo menos um jogador.');
      return;
    }

    if (this.origem_gestao_equipa) {
      console.log("JogadorSeleccaoComponent | Retornando add_multiple para gestão de equipa");
      // Para gestão de equipa, adicionar múltiplos jogadores
      const jogadoresParaAdicionar: jogadorData[] = [];
      for (const id of this.jogadoresSelecionados) {
        const posicao = this.jogadores.findIndex(x => x.id_Jogador == id);
        if (posicao !== -1) {
          jogadoresParaAdicionar.push({
            id: this.jogadores[posicao].id_Jogador,
            nome: this.jogadores[posicao].nome_Jogador,
            nome_completo: '',
            data_nascimento: 0,
            email: '',
            telemovel: '',
            pai_nome: '',
            pai_email: '',
            pai_telemovel: '',
            mae_nome: '',
            mae_email: '',
            mae_telemovel: '',
            morada: '',
            cidade: '',
            codigo_postal: '',
            observacoes: '',
            numero: '',
            cc: '',
            nif: 0,
            licenca: 0
          });
        }
      }
      console.log("JogadorSeleccaoComponent | Dados a retornar:", { action: 'add_multiple', data: jogadoresParaAdicionar });
      this.activeModal.close({ action: 'add_multiple', data: jogadoresParaAdicionar });
    } else {
      console.log("JogadorSeleccaoComponent | Retornando presenca_multiple para presença");
      // Para presença, adicionar múltiplos jogadores
      const jogadoresPresenca: jogadorPresencaData[] = [];
      for (const id of this.jogadoresSelecionados) {
        const posicao = this.jogadores.findIndex(x => x.id_Jogador == id);
        if (posicao !== -1) {
          jogadoresPresenca.push({
            id_jogador: this.jogadores[posicao].id_Jogador,
            nome_jogador: this.jogadores[posicao].nome_Jogador,
            estado: "Presente",
            motivo: "",
            estilo_estado: "background-color: lightgreen;",
            apagar: true
          });
        }
      }
      console.log("JogadorSeleccaoComponent | Dados a retornar:", { action: 'presenca_multiple', data: jogadoresPresenca });
      this.activeModal.close({ action: 'presenca_multiple', data: jogadoresPresenca });
    }
  }

  cancelarSelecao() {
    console.log("JogadorSeleccaoComponent | Cancelar seleção");
    this.activeModal.close({ action: 'cancel' });
  }

  novoJogador() {
    console.log("JogadorSeleccaoComponent | Novo Jogador");
    this.activeModal.close({ action: 'novo' });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/img/jogadores/default_avatar.jpg';
    }
  }

  filtrarPorEquipa(equipa: string) {
    console.log("JogadorSeleccaoComponent | Filtrando por equipa:", equipa);
    this.filtro_equipa = equipa;
    // Aqui você pode implementar a lógica de filtragem por equipa
    // Por enquanto, apenas define o filtro
  }

}
