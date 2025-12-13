import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { JogoService } from "../../services/jogo.service";
import { CommonModule } from "@angular/common";
import { environment } from "../../../environments/environment";
import { ClubeService } from "../../services/clube.service";
import { FormsModule } from "@angular/forms";
import { CompeticaoData } from "./competicaoData";
import { JogoData, JogadorJogo } from "../lista-jogos/jogoData";
import { EquipaData } from "../equipa/equipaData";


// Estenda a interface JogadorJogo para incluir a propriedade 'expanded'
interface JogadorJogoExpandable extends JogadorJogo {
  expanded?: boolean; // Propriedade opcional para controlar a expansão
}

// Atualize a interface JogoData para usar a nova interface de jogador
interface JogoDataWithExpandablePlayers extends JogoData {
  jogadores: JogadorJogoExpandable[];
}


@Component({
  selector: 'jogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jogo.component.html',
  styleUrl: './jogo.component.css'
})

export class JogoComponent implements OnInit {


  loading: boolean = false;
  idJogo: number=0;
  // Use a nova interface para o objeto jogo
  jogo: JogoDataWithExpandablePlayers = {
    id: 0,
    epoca_id: 0,
    equipa_id: 0,
    tipoEquipa: '',
    data: new Date(),
    hora: '',
    local: '',
    golos_equipa: 0,
    equipa_adv_id: 0,
    equipa_adv_nome: '',
    tipoEquipa_adv: '',
    golos_equipa_adv: 0,
    tipo_local: '',
    competicao_id: 0,
    competicao_nome: '',
    competicao_outro_descritivo: '',
    arbitro_1: 0,
    arbitro_2: 0,
    estado: '',
    hora_concentracao: '',
    obs: '',
    numeroJogo:'',
    jogadores: []
  }

  meuClubeid: number = environment.clube_id
  nomeClube: string = "";
  mostrarRegisto: boolean = false;

  tiposGolo = [
    { key: 'p', label: 'Penalty' },
    { key: 'ld', label: 'Livre Direto' },
    { key: 'pp', label: 'Power Play' },
    { key: 'up', label: 'Under Play' },
    { key: 'normal', label: 'Normal' }
  ];
  tiposCartao = [
    { key: 'amarelo', label: 'Amarelo' },
    { key: 'azul', label: 'Azul' },
    { key: 'vermelho', label: 'Vermelho' }
  ];

  atletasIndisponiveis: JogadorConvocado[] = [];

  constructor(private route: ActivatedRoute, private jogoService: JogoService, private clubeService: ClubeService, private router: Router,) { }

  ngOnInit() {
    this.loading = true;
    const routeParams = this.route.snapshot.paramMap;
    this.idJogo = Number(routeParams.get('id'));
    this.jogoService.getJogoById(this.idJogo).subscribe({
      next: (data) => {
        // Ao carregar os dados do jogo, inicialize a propriedade 'expanded' para cada jogador
        this.jogo = {
          ...data,
          jogadores: data.jogadores.map((jogador: JogadorJogo) => ({ ...jogador, expanded: false }))
        };
        //carregar a convocatória para obter os jogadores indisponíveis
        this.atletasIndisponiveis = data.jogadores.filter(j => j.estado !== 'CONVOCADO').map(j => ({
          id_jogador: j.id_jogador,
          nome: j.nome,
          estado: j.estado,
          obs: j.obs,
          licenca:""
        }));

        //retirar os jogadores indisponíveis da lista de jogadores do jogo
        this.jogo.jogadores = this.jogo.jogadores.filter(j => j.estado === 'CONVOCADO');

        //marcar o GR
        this.jogo.jogadores.forEach(j => {
          if(j.golos_s_normal>0 || j.golos_s_p>0 || j.golos_s_ld>0 || j.golos_s_up>0 || j.golos_s_pp>0){
            j.isGR = true;
          }
        })

        this.loading = false;
        console.log('Jogo Componente | Dados do jogo:', this.jogo);
      }});

    this.clubeService.getClube(this.meuClubeid).subscribe({
      next: (data) => {
        this.nomeClube = data.nome;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/listajogos']);
  }

  registarInformacaoJogo() {
    this.mostrarRegisto = true;
  }

  // Novo método para alternar a expansão de um jogador
  toggleJogadorExpand(idJogador: number): void {
    const jogador = this.jogo.jogadores.find(j => j.id_jogador === idJogador);
    if (jogador) {
      jogador.expanded = !jogador.expanded;
    }
  }

  alterarGolo(jogador: JogadorJogoExpandable, tipo: string, marcado: boolean, delta: number) {
    let prop: keyof JogadorJogoExpandable | '' = '';
    if (marcado) {
      switch (tipo) {
        case 'p': prop = 'golos_p'; break;
        case 'ld': prop = 'golos_ld'; break;
        case 'pp': prop = 'golos_pp'; break;
        case 'up': prop = 'golos_up'; break;
        case 'normal': prop = 'golos_normal'; break;
      }
      this.jogo.golos_equipa += delta;
    } else {
      switch (tipo) {
        case 'p': prop = 'golos_s_p'; break;
        case 'ld': prop = 'golos_s_ld'; break;
        case 'pp': prop = 'golos_s_pp'; break;
        case 'up': prop = 'golos_s_up'; break;
        case 'normal': prop = 'golos_s_normal'; break;
      }
      this.jogo.golos_equipa_adv += delta;
    }
    if (prop) {
      jogador[prop] = Math.max(0, (jogador[prop] || 0) + delta);
    }
  }

  getGoloCount(jogador: JogadorJogoExpandable, tipo: string, marcado: boolean): number {
    let prop: keyof JogadorJogoExpandable | '' = '';
    if (marcado) {
      switch (tipo) {
        case 'p': prop = 'golos_p'; break;
        case 'ld': prop = 'golos_ld'; break;
        case 'pp': prop = 'golos_pp'; break;
        case 'up': prop = 'golos_up'; break;
        case 'normal': prop = 'golos_normal'; break;
      }
    } else {
      switch (tipo) {
        case 'p': prop = 'golos_s_p'; break;
        case 'ld': prop = 'golos_s_ld'; break;
        case 'pp': prop = 'golos_s_pp'; break;
        case 'up': prop = 'golos_s_up'; break;
        case 'normal': prop = 'golos_s_normal'; break;
      }
    }
    return prop ? (jogador[prop] || 0) : 0;
  }

  alterarCartao(jogador: JogadorJogoExpandable, tipo: string, delta: number) {
    let prop: keyof JogadorJogoExpandable | '' = '';
    switch (tipo) {
      case 'amarelo': prop = 'amarelo'; break;
      case 'azul': prop = 'azul'; break;
      case 'vermelho': prop = 'vermelho'; break;
    }
    if (prop) {
      jogador[prop] = Math.max(0, (jogador[prop] || 0) + delta);
    }
  }

  getCartaoCount(jogador: JogadorJogoExpandable, tipo: string): number {
    let prop: keyof JogadorJogoExpandable | '' = '';
    switch (tipo) {
      case 'amarelo': prop = 'amarelo'; break;
      case 'azul': prop = 'azul'; break;
      case 'vermelho': prop = 'vermelho'; break;
    }
    return prop ? (jogador[prop] || 0) : 0;
  }

  // Garante que só um jogador é capitão
  definirCapitao(jogadorCapitao: JogadorJogoExpandable) {
    this.jogo.jogadores.forEach(j => {
      if (j !== jogadorCapitao) {
        j.capitao = false;
      }
    });
  }

  // Salvar registo (exemplo)
  salvarRegisto() {
    this.mostrarRegisto = false;
    console.log('Registo salvo:', this.jogo.jogadores);
    // Aqui pode enviar para backend ou atualizar estado
    this.jogo.estado='CONCLUIDO';
    //adicionar os jogadores indisponiveis à lista de jogadores do jogo
    this.jogo.jogadores.push(
      ...this.atletasIndisponiveis.map(atleta => ({
        id_jogador: atleta.id_jogador,
        nome: atleta.nome,
        capitao: false,
        numero: 0,
        amarelo: 0,
        azul: 0,
        vermelho: 0,
        golos_p: 0,
        golos_ld: 0,
        golos_pp: 0,
        golos_up: 0,
        golos_normal: 0,
        golos_s_p: 0,
        golos_s_ld: 0,
        golos_s_pp: 0,
        golos_s_up: 0,
        golos_s_normal: 0,
        estado: atleta.estado,
        obs: atleta.obs,
        isGR: false,
        expanded: false
      }))
    );


    this.jogoService.atualizarJogo(this.jogo).subscribe({
      next: (data) => {
        console.log('Jogo atualizado com sucesso:', data);
        this.jogo = {
          ...data,
          jogadores: data.jogadores.map((jogador: JogadorJogo) => ({ ...jogador, expanded: false }))
        }; // Atualiza o jogo com a resposta do backend
        //volta a retirar os jogadores indisponíveis da lista de jogadores do jogo
        this.jogo.jogadores = this.jogo.jogadores.filter(j => j.estado === 'CONVOCADO');

        //marcar o GR
        this.jogo.jogadores.forEach(j => {
          if (j.golos_s_ld>0 || j.golos_s_p>0 || j.golos_s_up>0 || j.golos_s_pp>0 || j.golos_s_normal>0){
            j.isGR = true;
          }
        });
      },
      error: (error) => {
        console.error('Erro ao atualizar o jogo:', error);
        // Aqui pode adicionar lógica para reverter mudanças ou notificar o usuário
      }
    });
  }

  // Implementação do método editarJogo
  editarJogo(): void {
    // Define mostrarRegisto como true para exibir a seção de registro
    this.mostrarRegisto = true;
    // O estado do jogo pode ser alterado para 'INICIADO' ou mantido como 'CONCLUIDO'
    // dependendo da sua lógica de negócio para edição de jogos já concluídos.
    // Por exemplo, se você quiser que a edição de um jogo concluído o coloque de volta em 'INICIADO':
    // this.jogo.estado = 'INICIADO';

    // O formulário já estará preenchido com os dados atuais do objeto 'jogo'
    // devido ao two-way data binding (ngModel).
    console.log('Entrando no modo de edição do jogo.');
  }

  // Novo método para navegar para a convocatória
  verConvocatoria(idJogo: number): void {
    this.router.navigate(['/convocatoria', idJogo]);
  }

  // Método para verificar se o jogador tem estatísticas
  hasStats(jogador: JogadorJogoExpandable): boolean {
    return (jogador.golos_normal || 0) > 0 ||
           (jogador.golos_p || 0) > 0 ||
           (jogador.golos_pp || 0) > 0 ||
           (jogador.golos_up || 0) > 0 ||
           (jogador.golos_ld || 0) > 0 ||
           (jogador.golos_s_normal || 0) > 0 ||
           (jogador.golos_s_p || 0) > 0 ||
           (jogador.golos_s_pp || 0) > 0 ||
           (jogador.golos_s_up || 0) > 0 ||
           (jogador.golos_s_ld || 0) > 0 ||
           (jogador.amarelo || 0) > 0 ||
           (jogador.azul || 0) > 0 ||
           (jogador.vermelho || 0) > 0;
  }
}
