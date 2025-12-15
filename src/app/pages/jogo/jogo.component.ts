import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { JogoService } from "../../services/jogo.service";
import { PdfService, GameData, PlayerData } from "../../services/pdf.service";
import { CommonModule } from "@angular/common";
import { environment } from "../../../environments/environment";
import { ClubeService } from "../../services/clube.service";
import { FormsModule } from "@angular/forms";
import { CompeticaoData } from "./competicaoData";
import { JogoData, JogadorJogo } from "../lista-jogos/jogoData";
import { EquipaData } from "../equipa/equipaData";
import { JogadorConvocado } from "../convocatoria/convocatoriaData";


// Estenda a interface JogadorJogo para incluir a propriedade 'expanded'
interface JogadorJogoExpandable extends JogadorJogo {
  expanded?: boolean; // Propriedade opcional para controlar a expansão
  expandedView?: boolean; // Propriedade para controlar a expansão na visualização
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

  constructor(private route: ActivatedRoute, private jogoService: JogoService, private clubeService: ClubeService, private pdfService: PdfService, private router: Router,) { }

  ngOnInit() {
    this.loading = true;
    const routeParams = this.route.snapshot.paramMap;
    this.idJogo = Number(routeParams.get('id'));
    this.jogoService.getJogoById(this.idJogo).subscribe({
      next: (data) => {
// Ao carregar os dados do jogo, inicialize a propriedade 'expanded' para cada jogador
        this.jogo = {
          ...data,
          jogadores: data.jogadores.map((jogador: JogadorJogo) => ({
            ...jogador,
            expanded: false,
            expandedView: false
          }))
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

  // Método para alternar a visualização detalhada do jogador no modo de visualização
  toggleJogadorView(idJogador: number): void {
    const jogador = this.jogo.jogadores.find(j => j.id_jogador === idJogador);
    if (jogador) {
      jogador.expandedView = !jogador.expandedView;
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

  // Métodos para controlar as novas estatísticas
  alterarEstatistica(jogador: JogadorJogoExpandable, tipo: string, delta: number) {
    let prop: keyof JogadorJogoExpandable | '' = '';
    switch (tipo) {
      case 'assistencias': prop = 'assistencias'; break;
      case 'recuperacoes_bola': prop = 'recuperacoes_bola'; break;
      case 'perdas_bola': prop = 'perdas_bola'; break;
      case 'remates': prop = 'remates'; break;
      case 'faltas': prop = 'faltas'; break;
      case 'penalty_defesa': prop = 'penalty_defesa'; break;
      case 'ld_defesa': prop = 'ld_defesa'; break;
      case 'penalty_falhado': prop = 'penalty_falhado'; break;
      case 'ld_falhado': prop = 'ld_falhado'; break;
    }
    if (prop) {
      jogador[prop] = Math.max(0, (jogador[prop] || 0) + delta);
    }
  }

  getEstatisticaCount(jogador: JogadorJogoExpandable, tipo: string): number {
    let prop: keyof JogadorJogoExpandable | '' = '';
    switch (tipo) {
      case 'assistencias': prop = 'assistencias'; break;
      case 'recuperacoes_bola': prop = 'recuperacoes_bola'; break;
      case 'perdas_bola': prop = 'perdas_bola'; break;
      case 'remates': prop = 'remates'; break;
      case 'faltas': prop = 'faltas'; break;
      case 'penalty_defesa': prop = 'penalty_defesa'; break;
      case 'ld_defesa': prop = 'ld_defesa'; break;
      case 'penalty_falhado': prop = 'penalty_falhado'; break;
      case 'ld_falhado': prop = 'ld_falhado'; break;
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
        // Novas estatísticas
        assistencias: 0,
        recuperacoes_bola: 0,
        perdas_bola: 0,
        remates: 0,
        faltas: 0,
        penalty_defesa: 0,
        ld_defesa: 0,
        penalty_falhado: 0,
        ld_falhado: 0,
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
          jogadores: data.jogadores.map((jogador: JogadorJogo) => ({
            ...jogador,
            expanded: false,
            expandedView: false
          }))
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
           (jogador.vermelho || 0) > 0 ||
           (jogador.assistencias || 0) > 0 ||
           (jogador.recuperacoes_bola || 0) > 0 ||
           (jogador.perdas_bola || 0) > 0 ||
           (jogador.remates || 0) > 0 ||
           (jogador.penalty_defesa || 0) > 0 ||
           (jogador.ld_defesa || 0) > 0 ||
           (jogador.penalty_falhado || 0) > 0 ||
           (jogador.ld_falhado || 0) > 0;
  }

  // Método para verificar se o jogador tem cartões
  hasCards(jogador: JogadorJogoExpandable): boolean {
    return (jogador.amarelo || 0) > 0 ||
           (jogador.azul || 0) > 0 ||
           (jogador.vermelho || 0) > 0;
  }

  // Método para verificar se o jogador tem outras estatísticas
  hasOtherStats(jogador: JogadorJogoExpandable): boolean {
    return (jogador.assistencias || 0) > 0 ||
           (jogador.recuperacoes_bola || 0) > 0 ||
           (jogador.perdas_bola || 0) > 0 ||
           (jogador.remates || 0) > 0 ||
           (jogador.faltas || 0) > 0 ||
           (jogador.penalty_defesa || 0) > 0 ||
           (jogador.ld_defesa || 0) > 0 ||
           (jogador.penalty_falhado || 0) > 0 ||
           (jogador.ld_falhado || 0) > 0;
  }

  // Método para calcular o total de golos marcados
  getTotalGolos(jogador: JogadorJogoExpandable): number {
    return (jogador.golos_normal || 0) +
           (jogador.golos_p || 0) +
           (jogador.golos_ld || 0) +
           (jogador.golos_pp || 0) +
           (jogador.golos_up || 0);
  }

  // Método para gerar a ficha estatística em PDF
  gerarFichaEstatistica(): void {
    try {
      console.log('🔍 Iniciando geração da ficha estatística...');
      console.log('📊 Dados do jogo:', this.jogo);
      console.log('🏢 Nome do clube:', this.nomeClube);

      // Teste simples para verificar se o método está sendo chamado
      alert('📊 Gerar ficha estatística');

      // Verificar se os dados necessários estão disponíveis
      if (!this.jogo || !this.jogo.id) {
        console.error('❌ Dados do jogo não estão disponíveis');
        alert('Erro: Dados do jogo não estão disponíveis');
        return;
      }

      if (!this.nomeClube) {
        console.error('❌ Nome do clube não está disponível');
        alert('Erro: Nome do clube não está disponível');
        return;
      }

      console.log('✅ Dados validados com sucesso');

      // Preparar dados do jogo para o PDF
      const gameData: GameData = {
        id: this.jogo.id,
        data: this.jogo.data,
        hora: this.jogo.hora,
        local: this.jogo.local,
        escalao: localStorage.getItem("descritivo_escalao") || '' .concat(this.jogo.tipoEquipa),
        competicao_nome: this.jogo.competicao_nome,
        competicao_id: this.jogo.competicao_id,
        numeroJogo: this.jogo.numeroJogo?.toString() || '',
        equipa_adv_id: this.jogo.equipa_adv_id,
        equipa_adv_nome: this.jogo.equipa_adv_nome,
        golos_equipa: this.jogo.golos_equipa,
        golos_equipa_adv: this.jogo.golos_equipa_adv,
        tipo_local: this.jogo.tipo_local,
        nomeClube: this.nomeClube,
        clube_id: this.meuClubeid // Added club_id for logo
      };

      // Preparar dados dos jogadores para o PDF - INCLUIR TODOS OS JOGADORES COM ESTATÍSTICAS
      // Primeiro, obter todos os jogadores do jogo original (incluindo indisponíveis)
      const todosJogadores = [
        ...this.jogo.jogadores.filter(j => j.estado === 'CONVOCADO'),
        ...this.atletasIndisponiveis.map(atleta => ({
          id_jogador: atleta.id_jogador,
          nome: atleta.nome,
          numero: 0, // Jogadores indisponíveis não têm número definido
          capitao: false,
          isGR: false,
          estado: atleta.estado,
          obs: atleta.obs,
          expanded: false,
          // Estatísticas zeradas para jogadores indisponíveis
          golos_normal: 0,
          golos_p: 0,
          golos_ld: 0,
          golos_pp: 0,
          golos_up: 0,
          golos_s_normal: 0,
          golos_s_p: 0,
          golos_s_ld: 0,
          golos_s_pp: 0,
          golos_s_up: 0,
          assistencias: 0,
          recuperacoes_bola: 0,
          perdas_bola: 0,
          remates: 0,
          faltas: 0,
          penalty_defesa: 0,
          ld_defesa: 0,
          penalty_falhado: 0,
          ld_falhado: 0,
          amarelo: 0,
          azul: 0,
          vermelho: 0
        }))
      ];

      const players: PlayerData[] = todosJogadores.map(jogador => ({
        id_jogador: jogador.id_jogador,
        nome: jogador.nome,
        numero: jogador.numero,
        capitao: jogador.capitao,
        isGR: jogador.isGR,
        expanded: false,
        estado: jogador.estado || 'CONVOCADO',
        obs: jogador.obs || '',
        // Include all statistics data when available
        golos_normal: jogador.golos_normal || 0,
        golos_p: jogador.golos_p || 0,
        golos_ld: jogador.golos_ld || 0,
        golos_pp: jogador.golos_pp || 0,
        golos_up: jogador.golos_up || 0,
        golos_s_normal: jogador.golos_s_normal || 0,
        golos_s_p: jogador.golos_s_p || 0,
        golos_s_ld: jogador.golos_s_ld || 0,
        golos_s_pp: jogador.golos_s_pp || 0,
        golos_s_up: jogador.golos_s_up || 0,
        assistencias: jogador.assistencias || 0,
        recuperacoes_bola: jogador.recuperacoes_bola || 0,
        perdas_bola: jogador.perdas_bola || 0,
        remates: jogador.remates || 0,
        faltas: jogador.faltas || 0,
        penalty_defesa: jogador.penalty_defesa || 0,
        ld_defesa: jogador.ld_defesa || 0,
        penalty_falhado: jogador.penalty_falhado || 0,
        ld_falhado: jogador.ld_falhado || 0,
        amarelo: jogador.amarelo || 0,
        azul: jogador.azul || 0,
        vermelho: jogador.vermelho || 0
      }));

      console.log('📋 Dados preparados para PDF:', { gameData, players });
      console.log('🔧 Chamando PDF service...');

      // Gerar o PDF
      this.pdfService.generateGameStatisticsPDF(gameData, players);

      console.log('✅ PDF service chamado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao gerar ficha estatística:', error);
      alert('Erro ao gerar a ficha estatística. Por favor, tente novamente.');
    }
  }
}
