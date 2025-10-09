import { PresencaService } from './../../services/presenca.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipaService } from '../../services/equipa.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroJogadorPipe } from './filtroJogador.pipe';
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
  idjogo: number = 0;

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private presencaService: PresencaService, private router: Router) { }



  ngOnInit() {
    this.spinner = true;
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
      this.origem_gestao_equipa = false;
    }

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

          } else {

          }
        },
        error: error => {
          console.log("FichaJogadorComponent | Serviço gravarFichaJogador Erro!!");

        }
      });

  }

  seleciona(indice_jogador: number) {

    console.log("JogadorSeleccaoComponent | Seleciona");
    console.log("JogadorSeleccaoComponent | Seleciona | jogadores:", this.jogadores);
    console.log("JogadorSeleccaoComponent | Seleciona | indice:", indice_jogador);

    if (this.origem_gestao_equipa) {
      console.log("Modo seleção jogador genérico");
      let posicao = this.jogadores.findIndex(x => x.id_Jogador == indice_jogador);
      let tmpJogador: jogadorData = {
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
      };



      // Inicia o spinner para indicar que uma operação está em andamento
      this.spinner = true;

      //verifica se está numa seleção de jogador para um jogo
      if (this.idjogo && this.idjogo > 0) {
        //está na seleção de jogador para um jogo
        console.log("JogadorSeleccaoComponent | Seleciona | Está na seleção de jogador para um jogo");

        const storedData = localStorage.getItem('convocatoria_jogo');
        let convocatoria: ConvocatoriaData[] = [];
        if (storedData) {
          convocatoria = JSON.parse(storedData);
          console.log('JogadorSeleccaoComponent | List loaded from session:', convocatoria);
        }
        console.log('JogadorSeleccaoComponent | Current convocatoria before adding:', convocatoria);
        //adiciona o jogador
        console.log('JogadorSeleccaoComponent | Adding player to convocatoria:', tmpJogador);
        convocatoria.push({ id_jogador: tmpJogador.id, nome_jogador: tmpJogador.nome, selecionado: true });
        console.log('JogadorSeleccaoComponent | Updated convocatoria:', convocatoria);
        //guardar na sessão
        const data = JSON.stringify(convocatoria);
        localStorage.setItem("convocatoria_jogo", data);
        console.log('JogadorSeleccaoComponent | Data saved to session:', data);




        this.router.navigate(['/convocatoria/' + this.idjogo]);
        this.spinner = false;
      } else {



        this.equipaService.addJogadorEquipa(tmpJogador, this.idEscalao).subscribe({
          next: (response) => {
            // O serviço retornou sucesso
            console.log('Jogador adicionado com sucesso:', response);

            this.router.navigate(['/gestao-equipa/' + this.idEscalao]);
            this.spinner = false; // Desativa o spinner
          },
          error: (error) => {
            // O serviço retornou um erro
            console.error('Erro ao adicionar jogador à equipa:', error);
            alert('Ocorreu um erro ao adicionar o jogador à equipa');
            this.router.navigate(['/gestao-equipa/' + this.idEscalao]);
            this.spinner = false; // Desativa o spinner
          }
        });
      }

    } else {

      let posicao = this.jogadores.findIndex(x => x.id_Jogador == indice_jogador);
      let tmpPresencaJogador: jogadorPresencaData = {
        id_jogador: this.jogadores[posicao].id_Jogador,
        nome_jogador: this.jogadores[posicao].nome_Jogador,
        estado: "Presente",
        motivo: "",
        estilo_estado: "background-color: lightgreen;"
        , apagar: true

      }

      let listaJogadoresPresenca: jogadorPresencaData[] = this.presencaService.getPresenca();
      const jaExiste = listaJogadoresPresenca.some(j => j.id_jogador === tmpPresencaJogador.id_jogador);
      if (!jaExiste) {
        listaJogadoresPresenca.push(tmpPresencaJogador);
        this.presencaService.setPresenca(listaJogadoresPresenca);
      }

      this.router.navigate(['/mpresenca'])
    }
  }

  cancelarSelecao() {
    console.log("JogadorSeleccaoComponent | Cancelar seleção");

    if(this.idjogo && this.idjogo > 0){
      this.router.navigate(['/convocatoria/' + this.idjogo]);
      return;
    }

    if (this.origem_gestao_equipa) {
      this.router.navigate(['/gestao-equipa' + '/' + this.idEscalao]);
    } else {
      this.router.navigate(['/mpresenca']);
    }
  }

  novoJogador() {
    console.log("StaffSeleccaoComponent | Novo Staff");

    this.router.navigate(['/novo-jogador/jogadorSeleccao/-' + this.idEscalao]);
  }

}
