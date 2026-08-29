import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { JogoService } from "../../services/jogo.service";
import { PdfService, GameData, PlayerData } from "../../services/pdf.service";
import { CommonModule } from "@angular/common";
import { environment } from "../../../environments/environment";
import { ClubeService } from "../../services/clube.service";
import { FormsModule } from "@angular/forms";
import { CompeticaoData } from "./competicaoData";
import { JogoData, JogadorJogo, JogoConfigData, JogoEventoData, AtualizarTempoJogoRequest } from "../lista-jogos/jogoData";
import { EquipaData } from "../equipa/equipaData";
import { JogadorConvocado } from "../convocatoria/convocatoriaData";
import { EquipaService } from "../../services/equipa.service";
import { LoginServiceService } from "../../services/login-service.service";



// Estenda a interface JogadorJogo para incluir a propriedade 'expanded'
interface JogadorJogoExpandable extends JogadorJogo {
  expanded?: boolean; // Propriedade opcional para controlar a expansão
  expandedView?: boolean; // Propriedade para controlar a expansão na visualização
}

// Atualize a interface JogoData para usar a nova interface de jogador
interface JogoDataWithExpandablePlayers extends JogoData {
  jogadores: JogadorJogoExpandable[];
}

// Representa uma ação registada no histórico do novo painel de registo (permite desfazer)
interface HistoricoEvento {
  id: number;
  idJogador: number;
  categoria: 'golos' | 'cartoes' | 'mais';
  key: string;
  delta: number;
  label: string;
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
  // Controla a visualização de estatísticas completas ou simplificadas
  mostrarEstatisticasCompletas: boolean = false;
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
  mostrarLicencasView: boolean = false;
  modoEdicaoLicencas: boolean = false;
  guardandoLicencas: boolean = false;
  alteracoesFeitasLicencas: boolean = false;
  indiceJogadorAtual: number = 0;
  modoVisualizacaoLicencas: 'slide' | 'lista' = 'slide';
  staffLicencas: any[] = [];
  licencasSlide: any[] = [];

  tiposGolo = [
    { key: 'normal', label: 'Normal' },
    { key: 'p', label: 'Penalty' },
    { key: 'ld', label: 'Livre Direto' },
    { key: 'pp', label: 'Power Play' },
    { key: 'up', label: 'Under Play' }

  ];
  tiposCartao = [
    { key: 'amarelo', label: 'Amarelo' },
    { key: 'azul', label: 'Azul' },
    { key: 'vermelho', label: 'Vermelho' }
  ];

  atletasIndisponiveis: JogadorConvocado[] = [];

  // --- Novo painel de registo (seletor de jogadores + separadores + histórico) ---
  activeJogadorId: number | null = null;
  activeCategoria: 'golos' | 'cartoes' | 'mais' = 'golos';
  historicoRegisto: HistoricoEvento[] = [];
  private historicoSeq: number = 0;

  tiposEstatisticasCampo = [
    { key: 'assistencias', label: 'Assistência', icon: 'fa-star' },
    { key: 'recuperacoes_bola', label: 'Recuperação', icon: 'fa-shield-halved' },
    { key: 'perdas_bola', label: 'Perda de bola', icon: 'fa-rotate' },
    { key: 'remates', label: 'Remate', icon: 'fa-bullseye' },
    { key: 'faltas', label: 'Falta', icon: 'fa-flag' },
    { key: 'penalty_falhado', label: 'Penalty falhado', icon: 'fa-xmark' },
    { key: 'ld_falhado', label: 'Livre falhado', icon: 'fa-xmark' }
  ];
  tiposEstatisticasGR = [
    { key: 'penalty_defesa', label: 'Defesa de penalty', icon: 'fa-hand' },
    { key: 'ld_defesa', label: 'Defesa de livre direto', icon: 'fa-hand' }
  ];

  // ================= Modo de registo: Normal / Cronómetro =================
  modoRegisto: string = 'NORMAL';
  cronometroEmExecucao: boolean = false;
  cronoTimer: any = null;
  cronoJogoIniciado: boolean = false;
  // Verdadeiro assim que a parte atual foi efetivamente iniciada (INICIO_JOGO ou
  // INICIO_PARTE já registado); falso logo que a parte termina, até o utilizador
  // voltar a carregar em "Iniciar" para começar a parte seguinte.
  cronoParteEmCurso: boolean = false;
  cronoTempoRestante: number = 25 * 60;   // segundos que faltam na parte
  cronoDuracaoParteMin: number = 25;      // minutos por parte
  cronoNumeroPartes: number = 2;
  cronoParteAtual: number = 1;
  cronoTempoAbsoluto: number = 0;         // segundos acumulados de partes anteriores
  cronoMaxIniciais: number = 5;
  cronoExclusaoAzulSeg: number = 120;
  cronoConfigGuardar: boolean = false;
  cronoConfigSalva: boolean = false; // Controla se a configuração já foi guardada
  cronoConfigEditando: boolean = false; // Controla se o bloco de configuração está visível para edição, depois de já ter sido guardado

  // Edição manual do tempo decrescente do cronómetro
  cronoTempoEdicaoAtiva: boolean = false;
  cronoTempoEdicaoValor: string = '';
  timelineFiltroTodos: boolean = false; // false = mostra só golos/assistências/cartões
  // Em modo de visualização (sem o painel de registo aberto), controla se se vê a
  // timeline (true) ou a lista normal de jogadores (false, o valor por defeito).
  mostrarTimelineVisualizacao: boolean = false;

  // Modal de visualização de tempos de jogo
  mostrarModalTemposJogo: boolean = false;

  // Sistema de contagem de tempo de jogo em tempo real
  private tempoEntradaJogadores: Map<number, number> = new Map(); // jogador -> tempo de entrada (segundos absolutos)

  timeline: JogoEventoData[] = [];
  temposJogo: JogadorJogoExpandable[] = [];

  mostrarModalSubstituicao: boolean = false;
  substituicaoEntraSelecionados: number[] = [];
  substituicaoSaiSelecionados: number[] = [];

  mostrarModalEvento: boolean = false;
  eventoEmEdicao: JogoEventoData | null = null;
  tiposEventoDisponiveis: string[] = [
    'GOLO', 'GOLO_SOFRIDO', 'AMARELO', 'AZUL', 'VERMELHO', 'FALTA', 'ASSISTENCIA',
    'RECUPERACAO_BOLA', 'PERDA_BOLA', 'REMATE', 'PENALTY_FALHADO', 'PENALTY_DEFESA',
    'LD_FALHADO', 'LD_DEFESA', 'SUBSTITUICAO', 'INICIO_JOGO', 'INICIO_PARTE',
    'FIM_PARTE', 'FIM_JOGO', 'CORRECAO_TEMPO'
  ];

  constructor(private route: ActivatedRoute, private jogoService: JogoService, private clubeService: ClubeService, private pdfService: PdfService, private router: Router, private equipaService: EquipaService, private loginservice: LoginServiceService) { }

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
          if (j.gr) {
            j.isGR = true;
          }
        })

        // Initialize licencasSlide with jogadores immediately
        this.licencasSlide = this.jogo.jogadores.map(j => ({ ...j, tipo: 'jogador' }));

        // Carregar staff for licenças - try different approaches
        const equip = this.equipaService.getEquipa();
        console.log('Equipa from service:', equip);
        if (equip && equip.staff && equip.staff.length > 0) {
          console.log('Staff from getEquipa:', equip.staff);
          this.processStaff(equip.staff);
        } else {
          // Try loading from localStorage or API
          const equipaId = localStorage.getItem("idequipa_escalao");
          console.log('Equipa ID from localStorage:', equipaId);
          if (equipaId) {
            this.equipaService.getEquipabyIDLight(equipaId).subscribe({
              next: (equipaData: any) => {
                console.log('Equipa data from API:', equipaData);
                if (equipaData && equipaData.staff && equipaData.staff.length > 0) {
                  console.log('Staff from API:', equipaData.staff);
                  this.processStaff(equipaData.staff);
                } else {
                  console.log('No staff found in API response');
                }
              },
              error: (err) => console.error('Error loading equipa:', err)
            });
          }
        }

        this.loading = false;

        // Se o jogo já estiver configurado em modo cronómetro, ativar a interface
        if (data && data.config && data.config.modo_registo === 'CRONOMETRO') {
          this.modoRegisto = 'CRONOMETRO';
          this.carregarModoCronometro();
        }

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

  mostrarLicencas(): void {
    this.mostrarLicencasView = true;
    this.indiceJogadorAtual = 0;


  }

  fecharLicencas(): void {
    if (this.modoEdicaoLicencas && this.alteracoesFeitasLicencas) {
      const confirmar = confirm('Tem alterações não guardadas. Deseja guardar as alterações antes de sair?');
      if (confirmar) {
        this.guardarAlteracoesLicencas();
        return;
      }
    }
    this.mostrarLicencasView = false;
    this.modoEdicaoLicencas = false;
    this.alteracoesFeitasLicencas = false;
  }

  proximoJogador(): void {
    if (this.licencasSlide && this.indiceJogadorAtual < this.licencasSlide.length - 1) {
      this.indiceJogadorAtual++;
    }
  }

  anteriorJogador(): void {
    if (this.indiceJogadorAtual > 0) {
      this.indiceJogadorAtual--;
    }
  }

  // Touch handling for mobile swipe
  touchStartX: number = 0;
  touchEndX: number = 0;
  minSwipeDistance: number = 50;

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;

    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe right - previous player
        this.anteriorJogador();
      } else {
        // Swipe left - next player
        this.proximoJogador();
      }
    }
  }

  private processStaff(staffList: any[]): void {
    // Sort by funcao alphabetically
    const sortedStaff = [...staffList].sort((a: any, b: any) => 
      (a.tipo || 'Staff').localeCompare(b.tipo || 'Staff')
    );
    this.staffLicencas = sortedStaff.map((s: any) => ({
      licenca: s.licenca,
      nome: s.nome,
      funcao: s.tipo || 'Staff',
      id: s.id
    }));
    // Combine jogadores and staff
    this.licencasSlide = [
      ...this.jogo.jogadores.map(j => ({ ...j, tipo: 'jogador' })),
      ...this.staffLicencas.map(s => ({ ...s, tipo: 'staff' }))
    ];
    console.log('Staff loaded:', this.staffLicencas);
    console.log('Total licencasSlide:', this.licencasSlide.length);
  }

  registarInformacaoJogo() {
    this.mostrarRegisto = true;
    this.garantirJogadorAtivo();
  }

  // Garante que há sempre um jogador selecionado no painel (o primeiro convocado, por defeito)
  private garantirJogadorAtivo(): void {
    if (this.activeJogadorId === null || !this.jogo.jogadores.some(j => j.id_jogador === this.activeJogadorId)) {
      this.activeJogadorId = this.jogo.jogadores.length > 0 ? this.jogo.jogadores[0].id_jogador : null;
    }
  }

  // Seleciona o jogador ativo na fila de avatares
  selecionarJogadorAtivo(idJogador: number): void {
    this.activeJogadorId = idJogador;
    this.activeCategoria = 'golos';
  }

  // Devolve o jogador atualmente selecionado no painel
  getJogadorAtivo(): JogadorJogoExpandable | undefined {
    return this.jogo.jogadores.find(j => j.id_jogador === this.activeJogadorId);
  }

  // Troca o separador ativo (Golos / Cartões / Outras)
  definirCategoria(categoria: 'golos' | 'cartoes' | 'mais'): void {
    this.activeCategoria = categoria;
  }

  // Ponto único de entrada para registar uma ação a partir do novo painel.
  // Reaproveita a lógica de negócio já existente (alterarGolo / alterarCartao / alterarEstatistica)
  // e regista a ação no histórico para permitir desfazer.
  registarAcao(jogador: JogadorJogoExpandable, categoria: 'golos' | 'cartoes' | 'mais', key: string, delta: number, label: string): void {
    switch (categoria) {
      case 'golos':
        this.alterarGolo(jogador, key, !jogador.isGR, delta);
        break;
      case 'cartoes':
        this.alterarCartao(jogador, key, delta);
        break;
      case 'mais':
        this.alterarEstatistica(jogador, key, delta);
        break;
    }

    if (delta > 0) {
      this.historicoSeq++;
      this.historicoRegisto.unshift({
        id: this.historicoSeq,
        idJogador: jogador.id_jogador,
        categoria,
        key,
        delta,
        label: `${label} — ${jogador.nome.split(' ')[0]}`
      });
      this.historicoRegisto = this.historicoRegisto.slice(0, 8);
    }

    // Em modo cronómetro, cada evento é persistido de imediato na timeline
    if (this.modoRegisto === 'CRONOMETRO') {
      this.sincronizarEventoBackend(jogador, categoria, key, delta, label);
    }
  }

  // Desfaz uma ação do histórico, revertendo o valor no jogador correspondente
  desfazerAcao(idEvento: number): void {
    const indice = this.historicoRegisto.findIndex(e => e.id === idEvento);
    if (indice === -1) return;

    const evento = this.historicoRegisto[indice];
    const jogador = this.jogo.jogadores.find(j => j.id_jogador === evento.idJogador);
    if (jogador) {
      switch (evento.categoria) {
        case 'golos':
          this.alterarGolo(jogador, evento.key, !jogador.isGR, -evento.delta);
          break;
        case 'cartoes':
          this.alterarCartao(jogador, evento.key, -evento.delta);
          break;
        case 'mais':
          this.alterarEstatistica(jogador, evento.key, -evento.delta);
          break;
      }
    }
    this.historicoRegisto.splice(indice, 1);

    // Em modo cronómetro, também se elimina o evento correspondente no backend
    if (this.modoRegisto === 'CRONOMETRO') {
      const tipo = this.mapearTipoEvento(evento.categoria, evento.key, !!jogador?.isGR);
      if (tipo) {
        this.eliminarUltimoEvento(evento.idJogador, tipo.tipo, tipo.detalhe || '');
      }
    }
  }

  // Novo método para alternar a expansão de um jogador
  toggleJogadorExpand(idJogador: number): void {
    const jogador = this.jogo.jogadores.find(j => j.id_jogador === idJogador);
    if (jogador) {
      //retirar a expansão de todos os jogadores
      this.jogo.jogadores.forEach(j => {
        if (j.id_jogador !== idJogador) {
          j.expanded = false;
        }
      });

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

  /**
   * Em modo cronómetro não há botão "Salvar Registo" — as estatísticas e o
   * tempo de jogo já ficam gravados ao vivo através dos eventos, mas campos de
   * ficha como número, capitão ou guarda-redes só existem neste objeto em
   * memória. Sem isto, uma correção feita depois de o jogo já ter terminado
   * (quando o guardar automático do fim de jogo já aconteceu e não há mais
   * nenhum gatilho) nunca chegaria a ficar registada no detalhe dos
   * jogadores. Silencioso quando corre bem; avisa se falhar, para não passar
   * despercebido.
   */
  guardarAlteracaoFichaCronometro(): void {
    if (this.modoRegisto !== 'CRONOMETRO') return;
    this.persistirJogo(undefined, () => {
      alert('Não foi possível gravar esta alteração no servidor. Verifica a ligação e tenta novamente.');
    });
  }

  // Salvar registo (exemplo)
  // Cria a estrutura "vazia" de estatísticas para um atleta que não esteve
  // convocado, para poder ser incluído no envio ao backend sem afetar as suas
  // estatísticas (que ficam todas a 0).
  private criarJogadorIndisponivel(atleta: any): any {
    return {
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
      gr: false,
      expanded: false
    };
  }

  /**
   * Envia o jogo (com jogadores e estatísticas) para o backend e atualiza o
   * componente com a resposta. É o único ponto de gravação "completa" do jogo —
   * usado tanto no "Salvar Registo" como ao terminar o jogo em modo cronómetro —
   * para garantir que os jogadores e as suas estatísticas ficam sempre persistidos
   * da mesma forma, e não se perdem ao navegar para fora da página.
   */
  private persistirJogo(onSuccess?: () => void, onError?: () => void): void {
    // Junta os jogadores indisponíveis (não convocados) que ainda não estejam na
    // lista, para o backend receber sempre o plantel completo.
    const idsAtuais = new Set(this.jogo.jogadores.map(j => j.id_jogador));
    const indisponiveisEmFalta = this.atletasIndisponiveis.filter(a => !idsAtuais.has(a.id_jogador));
    this.jogo.jogadores.push(...indisponiveisEmFalta.map(a => this.criarJogadorIndisponivel(a)));

    this.jogoService.atualizarJogo(this.jogo).subscribe({
      next: (data) => {
        this.jogo = {
          ...data,
          jogadores: data.jogadores.map((jogador: JogadorJogo) => ({
            ...jogador,
            expanded: false,
            expandedView: false
          }))
        };
        // Retira de novo os jogadores indisponíveis da lista visível
        this.jogo.jogadores = this.jogo.jogadores.filter(j => j.estado === 'CONVOCADO');
        // Marca o GR
        this.jogo.jogadores.forEach(j => { if (j.gr) j.isGR = true; });
        if (onSuccess) onSuccess();
      },
      error: (error) => {
        console.error('Erro ao atualizar o jogo:', error);
        if (onError) onError();
      }
    });
  }

  salvarRegisto() {
    this.jogo.estado = 'CONCLUIDO';
    this.persistirJogo(() => {
      this.mostrarRegisto = false;
    });
  }

  // Implementação do método editarJogo
  editarJogo(): void {
    // Define mostrarRegisto como true para exibir a seção de registro
    this.mostrarRegisto = true;
    this.garantirJogadorAtivo();
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

  // Novo método para calcular o total de cartões
  getTotalCartoes(jogador: JogadorJogoExpandable): number {
    return (jogador.amarelo || 0) +
           (jogador.azul || 0) +
           (jogador.vermelho || 0);
  }

  // Novo método para verificar se o jogador tem alguma estatística
  hasAnyStats(jogador: JogadorJogoExpandable): boolean {
    return this.getTotalGolos(jogador) > 0 ||
           this.getTotalCartoes(jogador) > 0 ||
           (jogador.assistencias || 0) > 0 ||
           (jogador.recuperacoes_bola || 0) > 0 ||
           (jogador.perdas_bola || 0) > 0 ||
           (jogador.remates || 0) > 0 ||
           (jogador.faltas || 0) > 0;
  }

  // Novo método para navegar até um jogador específico
  scrollToJogador(idJogador: number): void {
    setTimeout(() => {
      const element = document.getElementById('jogador-' + idJogador);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
          gr: false,
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

  // Get player image URL
  getJogadorImage(idJogador: number): string {
    return `assets/img/jogadores/${idJogador}_avatar.jpg`;
  }

    // Get staff image URL
  getStaffImage(idJogador: number): string {
      console.log("Avatar staff "+idJogador)
      return `assets/img/jogadores/${idJogador}_avatar_staff.jpg`;
  }

  // Handle image error - replace with default
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/jogadores/default_avatar.jpg';
  }

  alternarModoVisualizacaoLicencas(): void {
    this.modoVisualizacaoLicencas = this.modoVisualizacaoLicencas === 'slide' ? 'lista' : 'slide';
    this.indiceJogadorAtual = 0;
  }

  toggleModoEdicaoLicencas(): void {
    this.modoEdicaoLicencas = !this.modoEdicaoLicencas;
    if (!this.modoEdicaoLicencas && this.alteracoesFeitasLicencas) {
      const confirmar = confirm('Tem alterações não guardadas. Deseja guardar as alterações?');
      if (confirmar) {
        this.guardarAlteracoesLicencas();
      } else {
        this.alteracoesFeitasLicencas = false;
        this.jogoService.getJogoById(this.idJogo).subscribe({
          next: (data) => {
            this.jogo = {
              ...data,
              jogadores: data.jogadores.map((jogador: JogadorJogo) => ({
                ...jogador,
                expanded: false,
                expandedView: false
              }))
            };
            this.jogo.jogadores = this.jogo.jogadores.filter(j => j.estado === 'CONVOCADO');
            this.jogo.jogadores.forEach(j => {
              if(j.gr) {
                j.isGR = true;
              }
            });
          }
        });
      }
    }
  }

  onAlteracaoNumeroOuBadge(): void {
    this.alteracoesFeitasLicencas = true;
  }

  guardarAlteracoesLicencas(): void {
    this.guardandoLicencas = true;
    
    //atualizar os valores das licenças slide, nos jogadores do jogo.
    let tmpJogador: jogadorData;
    this.licencasSlide.forEach(licenca => {
      const jogador = this.jogo.jogadores.find(j => j.id_jogador === licenca.id_jogador && licenca.tipo=='jogador');
      if (jogador) {
        jogador.numero = licenca.numero;
        if (jogador.licenca != licenca.licenca) {
          this.equipaService.loadJogadorbyId(jogador.id_jogador).subscribe(
            {
              next: data => {
                console.log("FichaJogadorComponent | loadJogadorbyId", data);
                if (data != null) {
                  tmpJogador = data;
                  tmpJogador.licenca = licenca.licenca
                  this.equipaService.updateJogador(this.loginservice.getLoginData().id, tmpJogador).subscribe();
                }
              }
            }
          );
        }
      }
    });

    //atualizar licença Staff

    //atualizar os valores das licenças slide, nos jogadores do jogo.
    let tmpStaff: staffData;
    this.licencasSlide.forEach(licenca => {
      const staff = this.equipaService.getEquipa().staff.find(j => j.id === licenca.id && licenca.tipo=='staff');
      if (staff) {
        
        if (staff.licenca != licenca.licenca) {
          this.equipaService.loadStaffbyId(staff.id).subscribe(
            {
              next: data => {
                console.log("FichaJogadorComponent | loadStaffbyId", data);
                if (data != null) {
                  tmpStaff = data;
                  tmpStaff.licenca = licenca.licenca
                  this.equipaService.updateStaff(this.loginservice.getLoginData().id, tmpStaff).subscribe();
                }
              }
            }
          );
        }
      }
    });


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
        };
        this.jogo.jogadores = this.jogo.jogadores.filter(j => j.estado === 'CONVOCADO');
        this.jogo.jogadores.forEach(j => {
          if(j.gr) {
            j.isGR = true;
          }
        });
        this.alteracoesFeitasLicencas = false;
        this.modoEdicaoLicencas = false;
        this.guardandoLicencas = false;

      },
      error: (error) => {
        console.error('Erro ao atualizar o jogo:', error);
        this.guardandoLicencas = false;
        alert('Erro ao guardar as alterações.');
      }
    });
  }

  // ==================================================================
  // ================= MODO CRONÓMETRO =================================
  // ==================================================================

  cronoDuracaoSeg(): number {
    const min = this.cronoDuracaoParteMin > 0 ? this.cronoDuracaoParteMin : 25;
    return min * 60;
  }

  cronoDuracaoTotalJogoSeg(): number {
    const partes = this.cronoNumeroPartes > 0 ? this.cronoNumeroPartes : 1;
    return this.cronoDuracaoSeg() * partes;
  }

  percentagemTempoJogado(jogador: JogadorJogoExpandable): number {
    const total = this.cronoDuracaoTotalJogoSeg();
    if (total <= 0) return 0;
    return Math.min(100, Math.round(((jogador.tempoJogoSegundos || 0) / total) * 100));
  }

  cronoAbsolutoAtual(): number {
    const duracao = this.cronoDuracaoSeg();
    const decorrido = duracao - this.cronoTempoRestante;
    return this.cronoTempoAbsoluto + Math.max(0, decorrido);
  }

  cronoFormatar(seg: number): string {
    const s = Math.max(0, seg);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }

  get cronoTempoDisplay(): string {
    return this.cronoFormatar(this.cronoTempoRestante);
  }

  // A configuração fica visível enquanto ainda não foi guardada, ou quando o utilizador
  // pede explicitamente para a editar através do botão "Editar".
  get mostrarConfigCrono(): boolean {
    return !this.cronoConfigSalva || this.cronoConfigEditando;
  }

  editarConfigCronometro(): void {
    this.cronoConfigEditando = true;
  }

  cancelarEdicaoConfigCronometro(): void {
    this.cronoConfigEditando = false;
  }

  definirModoRegisto(modo: string): void {
    this.modoRegisto = modo === 'CRONOMETRO' ? 'CRONOMETRO' : 'NORMAL';
    if (this.modoRegisto === 'CRONOMETRO') {
      this.carregarModoCronometro();
    } else {
      this.pararCronometro();
    }
  }

  carregarModoCronometro(): void {
    this.jogoService.getConfigJogo(this.idJogo).subscribe({
      next: (data: JogoConfigData) => {
        if (data) {
          // Não redefinir this.modoRegisto aqui: o utilizador já escolheu o modo no seletor.
          this.cronoDuracaoParteMin = data.duracao_parte_minutos || 25;
          this.cronoNumeroPartes = data.numero_partes || 2;
          this.cronoMaxIniciais = data.num_jogadores_iniciais || 5;
          this.cronoExclusaoAzulSeg = data.duracao_exclusao_azul_segundos || 120;
          this.cronoTempoRestante = this.cronoDuracaoSeg();

          // Marcar se a configuração de cronómetro já tinha sido guardada anteriormente
          // para ESTE jogo (e não apenas devolvida como valor por omissão pelo backend).
          this.cronoConfigSalva = !!data.modo_registo && data.modo_registo === 'CRONOMETRO';

          if (this.cronoConfigSalva && data.jogadores) {
            // Jogo já tinha o cronómetro configurado: repor o 5 inicial e o estado em
            // campo tal como foram gravados da última vez.
            data.jogadores.forEach((jj: JogadorJogo) => {
              const j = this.jogo.jogadores.find(x => x.id_jogador === jj.id_jogador);
              if (j) {
                j.titular = !!jj.titular;
                j.emCampo = !!jj.emCampo;
                j.excluidoAteSegundos = jj.excluidoAteSegundos ?? null;
              }
            });
          } else {
            // Jogo novo (ainda sem configuração de cronómetro guardada): garante que
            // nenhum jogador fica com o 5 inicial pré-selecionado.
            this.jogo.jogadores.forEach(j => {
              j.titular = false;
              j.emCampo = false;
              j.excluidoAteSegundos = null;
            });
          }
          this.recarregarTimeline();
          this.recarregarTempos();
        }
      },
      error: (err) => console.error('Erro ao carregar config cronómetro', err)
    });
  }

  guardarConfigCronometro(): void {
    if (this.cronoConfigGuardar) return;
    const titularesSelecionados = this.jogo.jogadores.filter(j => j.titular).length;
    if (titularesSelecionados !== this.cronoMaxIniciais) {
      alert(`Tens de escolher ${this.cronoMaxIniciais} jogadores iniciais. Escolheste ${titularesSelecionados}.`);
      return;
    }
    this.cronoConfigGuardar = true;
    const config: JogoConfigData = {
      id_jogo: this.idJogo,
      modo_registo: 'CRONOMETRO',
      duracao_parte_minutos: this.cronoDuracaoParteMin,
      numero_partes: this.cronoNumeroPartes,
      num_jogadores_iniciais: this.cronoMaxIniciais,
      duracao_exclusao_azul_segundos: this.cronoExclusaoAzulSeg,
      tempo_atual_segundos: this.cronoAbsolutoAtual(),
      jogadores: this.jogo.jogadores
        .filter(j => j.estado === 'CONVOCADO')
        .map(j => ({ ...j, titular: !!j.titular }))
    };
    this.jogoService.guardarConfigJogo(config).subscribe({
      next: (ok) => {
        this.cronoConfigGuardar = false;
        if (ok) {
          this.cronoConfigSalva = true;
          this.cronoConfigEditando = false;
          this.cronoTempoRestante = this.cronoDuracaoSeg();
          this.cronoTempoAbsoluto = this.cronoAbsolutoAtual();
        } else {
          alert('Não foi possível guardar a configuração.');
        }
      },
      error: (err) => {
        this.cronoConfigGuardar = false;
        console.error('Erro a guardar config cronómetro', err);
        alert('Erro a guardar a configuração.');
      }
    });
  }

  alternarTitular(jogador: JogadorJogoExpandable): void {
    const selecionados = this.jogo.jogadores.filter(j => j.titular).length;
    if (!jogador.titular && selecionados >= this.cronoMaxIniciais) {
      alert(`Só podem ser escolhidos ${this.cronoMaxIniciais} jogadores iniciais (o 5 inicial).`);
      return;
    }
    jogador.titular = !jogador.titular;
  }

  // ---------------- Controlo do cronómetro ----------------

  iniciarPararCronometro(): void {
    if (this.cronometroEmExecucao) {
      this.pararCronometro();
    } else {
      this.iniciarCronometro();
    }
  }

  iniciarCronometro(): void {
    if (!this.cronoJogoIniciado) {
      this.cronoJogoIniciado = true;
      this.registarEventoSimples('INICIO_JOGO', 'Início do jogo', () => this.reverterInicioFalhado('INICIO_JOGO'));
    } else if (!this.cronoParteEmCurso) {
      // Início de uma nova parte (2ª, 3ª, ...): só se regista o evento quando o
      // utilizador efetivamente carrega em "Iniciar" — não logo que a parte
      // anterior termina.
      this.registarEventoSimples('INICIO_PARTE', `Início da parte ${this.cronoParteAtual}`, () => this.reverterInicioFalhado('INICIO_PARTE'));
    } else {
      // Retomar depois de uma pausa manual a meio da parte (sem criar novo
      // evento): garante que quem está em campo volta a contar tempo.
      this.jogo.jogadores.forEach(j => {
        if (j.emCampo) this.registarEntradaJogador(j.id_jogador);
      });
    }
    this.cronoParteEmCurso = true;
    this.cronometroEmExecucao = true;
    this.cronoTimer = setInterval(() => this.tickCronometro(), 1000);
  }

  /**
   * Chamado quando o INICIO_JOGO/INICIO_PARTE definitivamente não foi gravado no
   * servidor (depois de repetir). O relógio tinha arrancado localmente de forma
   * otimista — sem isto, ficaria a correr e a mostrar tempo a decorrer sem que
   * nada disso ficasse persistido, e essa parte do jogo nunca entraria na
   * contagem de tempo de cada jogador. Pára tudo e repõe o botão "Iniciar".
   */
  private reverterInicioFalhado(tipo: string): void {
    this.pararCronometro();
    if (tipo === 'INICIO_JOGO') {
      this.cronoJogoIniciado = false;
    } else {
      this.cronoParteEmCurso = false;
    }
  }

  pararCronometro(): void {
    this.cronometroEmExecucao = false;
    if (this.cronoTimer) {
      clearInterval(this.cronoTimer);
      this.cronoTimer = null;
    }
    this.sincronizarTempoAtual();
    
    // Acumula o tempo de todos os jogadores que estão em campo
    this.tempoEntradaJogadores.forEach((_, idJogador) => {
      this.registarSaidaJogador(idJogador);
    });
  }

  tickCronometro(): void {
    if (this.cronoTempoRestante <= 0) {
      this.terminarParteAtual();
      return;
    }
    this.cronoTempoRestante--;
    this.atualizarTemposEmTempoReal(); // Atualiza tempos em tempo real
    if (this.cronoTempoRestante % 5 === 0) {
      this.sincronizarTempoAtual();
      this.recarregarTempos();
    }
  }

  // ---------------- Sistema de contagem de tempo de jogo em tempo real ----------------

  /**
   * Atualiza os tempos de jogo de todos os jogadores em tempo real
   * Conta apenas o tempo em que o jogador está efetivamente em campo
   */
  atualizarTemposEmTempoReal(): void {
    if (!this.cronometroEmExecucao) return;

    const tempoAtual = this.cronoAbsolutoAtual();

    // Atualiza o tempo de cada jogador
    this.jogo.jogadores.forEach(jogador => {
      if (jogador.emCampo && this.tempoEntradaJogadores.has(jogador.id_jogador)) {
        // Jogador está em campo - calcula o tempo decorrido desde a entrada
        const tempoEntrada = this.tempoEntradaJogadores.get(jogador.id_jogador)!;
        const tempoDecorrido = tempoAtual - tempoEntrada;

        // Atualiza o tempo total (acumulado + tempo atual)
        const tempoBase = jogador.tempoJogoSegundos || 0;
        jogador.tempoJogoSegundos = tempoBase + tempoDecorrido;

        // Atualiza o tempo de entrada para o próximo ciclo
        this.tempoEntradaJogadores.set(jogador.id_jogador, tempoAtual);
      }
    });
  }

  /**
   * Regista que um jogador entrou em campo
   */
  registarEntradaJogador(idJogador: number): void {
    if (!this.tempoEntradaJogadores.has(idJogador)) {
      this.tempoEntradaJogadores.set(idJogador, this.cronoAbsolutoAtual());
    }
  }

  /**
   * Regista que um jogador saiu de campo e acumula o tempo
   */
  registarSaidaJogador(idJogador: number): void {
    if (this.tempoEntradaJogadores.has(idJogador)) {
      const tempoEntrada = this.tempoEntradaJogadores.get(idJogador)!;
      const tempoDecorrido = this.cronoAbsolutoAtual() - tempoEntrada;

      // Acumula o tempo no jogador
      const jogador = this.jogo.jogadores.find(j => j.id_jogador === idJogador);
      if (jogador) {
        jogador.tempoJogoSegundos = (jogador.tempoJogoSegundos || 0) + tempoDecorrido;
      }

      // Remove do mapa de tempos de entrada
      this.tempoEntradaJogadores.delete(idJogador);
    }
  }

  // Ordem "de fase" usada como critério de desempate quando dois eventos têm o
  // mesmo id_parte e o mesmo tempo_segundos (ex: o fim de uma parte e o fim do
  // jogo, quando o jogo acaba mesmo ao fim da última parte) — garante que os
  // eventos de início aparecem sempre primeiro e os de fim sempre por último.
  private faseOrdemEvento(tipo: string): number {
    const ordem: any = {
      INICIO_JOGO: 0,
      INICIO_PARTE: 1,
      FIM_PARTE: 8,
      FIM_JOGO: 9
    };
    return ordem[tipo] !== undefined ? ordem[tipo] : 5;
  }

  private compararEventos(a: JogoEventoData, b: JogoEventoData): number {
    const parteA = a.id_parte || 0;
    const parteB = b.id_parte || 0;
    if (parteA !== parteB) return parteA - parteB;
    const tempoA = a.tempo_segundos || 0;
    const tempoB = b.tempo_segundos || 0;
    if (tempoA !== tempoB) return tempoA - tempoB;
    return this.faseOrdemEvento(a.tipo_evento) - this.faseOrdemEvento(b.tipo_evento);
  }

  /**
   * Recalcula, do zero, o estado completo do jogo (quem está em campo e quanto
   * tempo cada jogador já jogou) a partir da timeline. É chamado sempre que a
   * timeline muda (registo, edição, eliminação ou adição manual de um evento),
   * para garantir que os tempos ficam sempre corretos — nomeadamente quando se
   * edita uma substituição ou corrige o tempo de um evento.
   */
  recomputarEstadoJogoDesdeTimeline(): void {
    this.tempoEntradaJogadores.clear();
    this.jogo.jogadores.forEach(j => {
      j.tempoJogoSegundos = 0;
      j.emCampo = false;
    });

    // Ordena cronologicamente: por parte, depois por tempo dentro da parte e,
    // em caso de empate exato, pela fase do evento (início antes, fim depois).
    const eventos = [...this.timeline].sort((a, b) => this.compararEventos(a, b));

    // "Estar em campo" (posição) e "estar a contar tempo" (relógio a correr) são
    // coisas distintas: no intervalo entre partes os jogadores continuam em campo
    // (podem ser substituídos), mas ninguém está a acumular tempo de jogo até a
    // parte seguinte começar de facto.
    const marcarEmCampo = (idJogador: number | null | undefined, emCampo: boolean): void => {
      if (!idJogador) return;
      const j = this.jogo.jogadores.find(x => x.id_jogador === idJogador);
      if (j) j.emCampo = emCampo;
    };

    const iniciarContagem = (idJogador: number | null | undefined, tempo: number): void => {
      if (!idJogador) return;
      if (!this.tempoEntradaJogadores.has(idJogador)) {
        this.tempoEntradaJogadores.set(idJogador, tempo);
      }
    };

    const pararContagem = (idJogador: number | null | undefined, tempo: number): void => {
      if (!idJogador) return;
      if (this.tempoEntradaJogadores.has(idJogador)) {
        const entrada = this.tempoEntradaJogadores.get(idJogador)!;
        const j = this.jogo.jogadores.find(x => x.id_jogador === idJogador);
        if (j) j.tempoJogoSegundos = (j.tempoJogoSegundos || 0) + Math.max(0, tempo - entrada);
        this.tempoEntradaJogadores.delete(idJogador);
      }
    };

    // Verdadeiro entre um "início" (jogo ou parte) e o "fim" seguinte — só nesse
    // intervalo é que o tempo de jogo é efetivamente contado.
    let relogioAberto = false;

    eventos.forEach(ev => {
      const tempoEv = ev.tempo_segundos || 0;
      switch (ev.tipo_evento) {
        case 'INICIO_JOGO':
          this.jogo.jogadores.forEach(j => {
            if (j.titular) {
              marcarEmCampo(j.id_jogador, true);
              iniciarContagem(j.id_jogador, tempoEv);
            }
          });
          relogioAberto = true;
          break;
        case 'INICIO_PARTE':
          // Retoma a contagem de tempo de quem está atualmente em campo — que
          // pode ter mudado durante o intervalo, através de substituições.
          this.jogo.jogadores.forEach(j => {
            if (j.emCampo) iniciarContagem(j.id_jogador, tempoEv);
          });
          relogioAberto = true;
          break;
        case 'SUBSTITUICAO':
          // A posição em campo muda sempre; o tempo só é parado/iniciado se o
          // relógio estiver mesmo a decorrer (substituições no intervalo apenas
          // trocam quem vai jogar a parte seguinte, sem contar tempo nenhum).
          marcarEmCampo(ev.id_jogador_secundario, false);
          marcarEmCampo(ev.id_jogador, true);
          if (relogioAberto) {
            pararContagem(ev.id_jogador_secundario, tempoEv);
            iniciarContagem(ev.id_jogador, tempoEv);
          }
          break;
        case 'AZUL':
        case 'VERMELHO':
          marcarEmCampo(ev.id_jogador, false);
          if (relogioAberto) pararContagem(ev.id_jogador, tempoEv);
          break;
        case 'FIM_PARTE':
        case 'FIM_JOGO':
          // Pára a contagem de tempo de todos, mas mantém a posição em campo —
          // no intervalo os jogadores continuam em campo e podem ser substituídos.
          Array.from(this.tempoEntradaJogadores.keys()).forEach(id => pararContagem(id, tempoEv));
          relogioAberto = false;
          break;
        case 'CORRECAO_TEMPO': {
          // Ajuste manual (em segundos, com sinal) ao tempo de jogo acumulado de um
          // jogador — usado para corrigir discrepâncias que a contagem automática não
          // conseguiu captar (ex: substituição não registada a tempo). É aplicado como
          // um valor fixo, independentemente de o relógio estar ou não a decorrer.
          const delta = parseInt(ev.detalhe || '0', 10);
          if (ev.id_jogador && !isNaN(delta) && delta !== 0) {
            const j = this.jogo.jogadores.find(x => x.id_jogador === ev.id_jogador);
            if (j) j.tempoJogoSegundos = Math.max(0, (j.tempoJogoSegundos || 0) + delta);
          }
          break;
        }
      }
    });

    // Se o cronómetro estiver a correr neste momento, quem está em campo depois
    // do último evento continua a contar tempo a partir de agora.
    if (this.cronometroEmExecucao) {
      const agora = this.cronoAbsolutoAtual();
      this.jogo.jogadores.forEach(j => {
        if (j.emCampo && !this.tempoEntradaJogadores.has(j.id_jogador)) {
          this.tempoEntradaJogadores.set(j.id_jogador, agora);
        }
      });
    }
  }

  sincronizarTempoAtual(): void {
    const req: AtualizarTempoJogoRequest = {
      id_jogo: this.idJogo,
      id_jogador: 0,
      tempo_correcao_segundos: 0,
      tempo_atual_segundos: this.cronoAbsolutoAtual(),
      tempo_atual_display: this.cronoTempoDisplay
    };
    this.jogoService.atualizarTempoAtual(req).subscribe({
      error: (err) => console.error('Erro ao sincronizar tempo', err)
    });
  }

  abrirEdicaoTempoCronometro(): void {
    this.cronoTempoEdicaoValor = this.cronoTempoDisplay;
    this.cronoTempoEdicaoAtiva = true;
  }

  guardarEdicaoTempoCronometro(): void {
    const seg = this.parseMMSS(this.cronoTempoEdicaoValor);
    if (seg < 0) {
      alert('Formato inválido. Usa MM:SS.');
      return;
    }
    this.cronoTempoRestante = seg;
    this.sincronizarTempoAtual();
    this.cronoTempoEdicaoAtiva = false;
  }

  cancelarEdicaoTempoCronometro(): void {
    this.cronoTempoEdicaoAtiva = false;
    this.cronoTempoEdicaoValor = this.cronoTempoDisplay;
  }

  // ---------------- Correção manual do tempo de jogo de um jogador ----------------

  /**
   * Permite corrigir manualmente os minutos de jogo de um atleta específico —
   * por exemplo quando uma substituição não foi registada no momento certo, ou
   * quando o cronómetro teve de ser corrigido e isso não se refletiu no tempo já
   * contabilizado. É pedido um valor em minutos (pode ser negativo) e gravado
   * como um evento CORRECAO_TEMPO próprio, para que a correção fique visível na
   * timeline e seja sempre respeitada quando os tempos são recalculados.
   */
  abrirCorrecaoTempoJogador(jogador: JogadorJogoExpandable): void {
    const atual = this.cronoFormatar(jogador.tempoJogoSegundos || 0);
    const resposta = window.prompt(
      `Ajustar tempo de jogo de ${jogador.nome} (atual: ${atual}).\nMinutos a somar (ex: 2) ou a subtrair (ex: -1.5):`,
      '0'
    );
    if (resposta === null) return;
    const minutos = parseFloat(resposta.trim().replace(',', '.'));
    if (isNaN(minutos) || minutos === 0) {
      if (resposta.trim() !== '' && resposta.trim() !== '0') {
        alert('Valor inválido. Indica um número de minutos, por exemplo 2 ou -1.5.');
      }
      return;
    }
    this.registarCorrecaoTempo(jogador, Math.round(minutos * 60));
  }

  registarCorrecaoTempo(jogador: JogadorJogoExpandable, deltaSegundos: number): void {
    const sinal = deltaSegundos > 0 ? '+' : '';
    const ev: JogoEventoData = {
      id_jogo: this.idJogo,
      id_parte: this.cronoParteAtual,
      tempo_evento: this.cronoTempoDisplay,
      tempo_segundos: this.cronoAbsolutoAtual(),
      tipo_evento: 'CORRECAO_TEMPO',
      id_jogador: jogador.id_jogador,
      id_jogador_secundario: 0,
      detalhe: `${sinal}${deltaSegundos}`,
      obs: `Correção manual de tempo de jogo (${sinal}${(deltaSegundos / 60).toFixed(1)} min)`
    };
    this.jogoService.registarEvento(ev).subscribe({
      next: () => {
        this.recarregarTimeline();
        this.recarregarTempos();
      },
      error: (err) => {
        console.error('Erro ao registar correção de tempo', err);
        alert('Erro ao registar a correção de tempo.');
      }
    });
  }

  terminarParteAtual(): void {
    this.pararCronometro();
    this.registarEventoSimples('FIM_PARTE', `Fim da parte ${this.cronoParteAtual}`);
    this.cronoParteEmCurso = false;
    if (this.cronoParteAtual >= this.cronoNumeroPartes) {
      this.terminarJogo();
      return;
    }
    // Acumula o tempo desta parte antes de avançar, para o relógio absoluto
    // (usado nos tempos de jogo e na timeline) continuar correto na parte seguinte.
    this.cronoTempoAbsoluto = this.cronoAbsolutoAtual();
    this.cronoParteAtual++;
    this.cronoTempoRestante = this.cronoDuracaoSeg();
    // O evento "Início da parte X" só é registado quando o utilizador carregar em
    // "Iniciar" para começar de facto a parte seguinte (ver iniciarCronometro()).
  }

  terminarJogo(): void {
    this.pararCronometro();
    
    // Acumula o tempo de todos os jogadores que estão em campo
    this.tempoEntradaJogadores.forEach((_, idJogador) => {
      this.registarSaidaJogador(idJogador);
    });
    
    this.registarEventoSimples('FIM_JOGO', 'Fim do jogo');
    this.cronoTempoRestante = this.cronoDuracaoSeg();
    this.cronoParteEmCurso = false;
    this.jogo.estado = 'CONCLUIDO';

    // Em modo cronómetro não há botão "Salvar Registo": as estatísticas, o tempo
    // de jogo e todos os eventos já ficam gravados ao vivo, evento a evento, à
    // medida que acontecem. Falta só persistir o estado "CONCLUIDO" do jogo e
    // quaisquer campos de ficha (capitão, número, observações) editados durante
    // o jogo — exatamente o que o botão fazia. Isto já é seguro: o backend, em
    // modo cronómetro, só toca nesses campos de ficha e nunca nas estatísticas,
    // tempo de jogo ou 5 inicial geridos pelo cronómetro.
    this.persistirJogo(
      () => { this.mostrarRegisto = false; },
      () => alert('O jogo terminou e ficou registado, mas não foi possível gravar o estado final no servidor. Verifica a ligação e tenta novamente mais tarde (Editar → Salvar).')
    );
  }

  registarEventoSimples(tipo: string, obs: string, onError?: () => void, tentativa: number = 1): void {
    const ev: JogoEventoData = {
      id_jogo: this.idJogo,
      id_parte: this.cronoParteAtual,
      tempo_evento: this.cronoTempoDisplay,
      tempo_segundos: this.cronoAbsolutoAtual(),
      tipo_evento: tipo,
      id_jogador: 0,
      id_jogador_secundario: 0,
      detalhe: null,
      obs
    };

    // Gere entradas/saídas de jogadores baseado no tipo de evento (atualização
    // otimista local — inclui já a posição em campo, para a contagem em tempo
    // real começar de imediato e não depender do resultado da chamada ao
    // backend; recarregarTimeline() confirma e corrige a seguir). Só faz isto na
    // 1ª tentativa — numa repetição, já foi feito.
    if (tentativa === 1) {
      if (tipo === 'INICIO_JOGO') {
        // No início do jogo, os titulares entram em campo
        this.jogo.jogadores.forEach(j => {
          if (j.titular) {
            j.emCampo = true;
            this.registarEntradaJogador(j.id_jogador);
          }
        });
      } else if (tipo === 'INICIO_PARTE') {
        // No início de uma nova parte, retoma a contagem de quem está atualmente em
        // campo — que pode ter mudado durante o intervalo, através de substituições.
        this.jogo.jogadores.forEach(j => {
          if (j.emCampo) {
            this.registarEntradaJogador(j.id_jogador);
          }
        });
      } else if (tipo === 'FIM_PARTE' || tipo === 'FIM_JOGO') {
        // No fim, pára a contagem de tempo de todos (mas mantém-se a posição em
        // campo, para o intervalo permitir substituições).
        this.tempoEntradaJogadores.forEach((_, idJogador) => {
          this.registarSaidaJogador(idJogador);
        });
      }
    }

    const eCritico = tipo === 'INICIO_JOGO' || tipo === 'INICIO_PARTE' || tipo === 'FIM_PARTE' || tipo === 'FIM_JOGO';

    this.jogoService.registarEvento(ev).subscribe({
      next: () => {
        if (eCritico) {
          // Para estes eventos estruturais não basta o pedido ter "dado sucesso":
          // confirma mesmo, lendo a timeline de volta, que o evento lá está —
          // protege contra o caso de o pedido ser aceite mas o evento não ficar
          // efetivamente disponível (ex: problema de validação no backend,
          // atraso de sincronização), que de outra forma passaria despercebido.
          this.verificarEventoCriticoGravado(tipo, ev.tempo_segundos!, obs, onError, tentativa);
        } else {
          this.recarregarTimeline();
          this.recarregarTempos();
        }
      },
      error: (err) => {
        console.error('Erro ao registar evento ' + tipo, err);
        if (tentativa < 2) {
          // Uma falha isolada de rede é comum; tenta mais uma vez antes de
          // incomodar o árbitro — este é um evento estrutural (início/fim de
          // jogo ou parte) e perdê-lo silenciosamente estraga a contagem de
          // tempo de jogo a partir daí.
          this.registarEventoSimples(tipo, obs, onError, tentativa + 1);
          return;
        }
        alert(
          `Não foi possível gravar "${obs}" no servidor (${tentativa} tentativas). ` +
          `Verifica a ligação à internet e tenta novamente — sem este evento, ` +
          `os tempos de jogo a partir daqui não vão ser contabilizados corretamente.`
        );
        if (onError) onError();
      }
    });
  }

  /**
   * Confirma que um evento estrutural (início/fim de jogo ou de parte) que
   * acabou de ser gravado aparece mesmo na timeline devolvida pelo servidor. Se
   * não aparecer, tenta gravá-lo novamente (até 2 tentativas no total); se
   * continuar sem aparecer, avisa claramente em vez de deixar o relógio a
   * correr como se estivesse tudo bem quando a parte não ficou marcada como
   * iniciada.
   */
  private verificarEventoCriticoGravado(tipo: string, tempoEsperado: number, obs: string, onError?: () => void, tentativa: number = 1): void {
    this.jogoService.getTimeline(this.idJogo).subscribe({
      next: (tl) => {
        const lista = tl || [];
        this.timeline = this.ordenarTimeline(lista);
        const existe = this.timeline.some(e => e.tipo_evento === tipo && Math.abs((e.tempo_segundos || 0) - tempoEsperado) <= 2);

        this.refletirEstadoEmCampo();
        this.recarregarTempos();
        this.sincronizarRelogioComTimeline();

        if (existe) return;

        if (tentativa < 2) {
          console.warn(`Evento ${tipo} não apareceu na timeline depois de gravado — a tentar novamente.`);
          this.registarEventoSimples(tipo, obs, onError, tentativa + 1);
          return;
        }

        alert(
          `"${obs}" foi enviado, mas não aparece na timeline do jogo depois de confirmar com o servidor. ` +
          `Verifica a lista de eventos do jogo — se não estiver lá, tenta carregar em "Iniciar" outra vez.`
        );
        if (onError) onError();
      },
      error: (err) => {
        console.error('Erro ao confirmar evento na timeline', err);
        this.recarregarTimeline();
      }
    });
  }

  // ---------------- Persistência dos eventos na timeline ----------------

  mapearTipoEvento(categoria: string, key: string, isGR: boolean): { tipo: string; detalhe: string | null } | null {
    if (categoria === 'golos') {
      return { tipo: isGR ? 'GOLO_SOFRIDO' : 'GOLO', detalhe: key };
    }
    if (categoria === 'cartoes') {
      const mapa: any = { amarelo: 'AMARELO', azul: 'AZUL', vermelho: 'VERMELHO' };
      return mapa[key] ? { tipo: mapa[key], detalhe: null } : null;
    }
    if (categoria === 'mais') {
      const mapa: any = {
        assistencias: 'ASSISTENCIA',
        recuperacoes_bola: 'RECUPERACAO_BOLA',
        perdas_bola: 'PERDA_BOLA',
        remates: 'REMATE',
        faltas: 'FALTA',
        penalty_defesa: 'PENALTY_DEFESA',
        ld_defesa: 'LD_DEFESA',
        penalty_falhado: 'PENALTY_FALHADO',
        ld_falhado: 'LD_FALHADO'
      };
      const tipo = mapa[key];
      return tipo ? { tipo, detalhe: null } : null;
    }
    return null;
  }

  sincronizarEventoBackend(jogador: JogadorJogoExpandable, categoria: string, key: string, delta: number, label: string): void {
    const map = this.mapearTipoEvento(categoria, key, !!jogador.isGR);
    if (!map) return;

    if (delta > 0) {
      const idEquipa = categoria === 'golos' && map.tipo === 'GOLO' ? 0 : 1;
      const ev: JogoEventoData = {
        id_jogo: this.idJogo,
        id_parte: this.cronoParteAtual,
        tempo_evento: this.cronoTempoDisplay,
        tempo_segundos: this.cronoAbsolutoAtual(),
        tipo_evento: map.tipo,
        id_jogador: jogador.id_jogador,
        id_jogador_secundario: 0,
        detalhe: map.detalhe,
        obs: label || null,
        id_equipa: idEquipa
      };
      this.jogoService.registarEvento(ev).subscribe({
        next: (evSalvo) => {
          if (evSalvo) {
            // Regista a saída do jogador para cartões que o removem do campo
            if (map.tipo === 'AZUL' || map.tipo === 'VERMELHO') {
              this.registarSaidaJogador(jogador.id_jogador);
              
              if (map.tipo === 'AZUL') {
                jogador.emCampo = false;
                jogador.excluidoAteSegundos = this.cronoAbsolutoAtual() + (this.cronoExclusaoAzulSeg || 120);
              } else if (map.tipo === 'VERMELHO') {
                jogador.emCampo = false;
              }
            }
            this.recarregarTimeline();
            this.recarregarTempos();
          }
        },
        error: (err) => console.error('Erro ao registar evento no backend', err)
      });
    } else {
      this.eliminarUltimoEvento(jogador.id_jogador, map.tipo, map.detalhe || '');
    }
  }

  eliminarUltimoEvento(idJogador: number, tipo: string, detalhe: string): void {
    const candidatos = this.timeline.filter(e =>
      e.id_jogador === idJogador &&
      e.tipo_evento === tipo &&
      (detalhe ? (e.detalhe || '') === detalhe : true)
    );
    const ultimo = candidatos.length ? candidatos[candidatos.length - 1] : null;
    if (!ultimo || !ultimo.id) {
      alert('Não encontrei o evento para desfazer.');
      return;
    }
    this.jogoService.eliminarEvento(ultimo.id).subscribe({
      next: (ok) => {
        if (ok) {
          this.recarregarTimeline();
        }
      },
      error: (err) => console.error('Erro ao eliminar evento', err)
    });
  }

  // ---------------- Timeline ----------------

  recarregarTimeline(): void {
    this.jogoService.getTimeline(this.idJogo).subscribe({
      next: (tl) => {
        // Ordena cronologicamente (por parte e depois por tempo dentro da parte),
        // para que os eventos da 2ª parte apareçam sempre depois dos da 1ª,
        // independentemente da ordem em que o backend os devolve.
        this.timeline = this.ordenarTimeline(tl || []);
        this.refletirEstadoEmCampo();
        this.recarregarTempos();
        // Deriva do zero se o jogo já foi iniciado, em que parte vai e quanto tempo
        // já passou — evita registar um "Início do jogo" duplicado (por exemplo,
        // depois de recarregar a página) e mostra sempre um valor correto do relógio
        // a quem está apenas a ver o jogo.
        this.sincronizarRelogioComTimeline();
      },
      error: (err) => console.error('Erro ao carregar timeline', err)
    });
  }

  /**
   * Deriva o estado do relógio (se o jogo já foi iniciado, em que parte vai e
   * quanto tempo já passou) a partir dos eventos da timeline. Corrige o relógio
   * ficar sempre a mostrar a duração total (em vez do tempo real já decorrido) e
   * evita registar um novo "Início do jogo" quando já existe um na timeline.
   * Não altera nada se o cronómetro já estiver a correr nesta mesma sessão.
   */
  sincronizarRelogioComTimeline(): void {
    const eventos = this.timeline; // já ordenada cronologicamente

    this.cronoJogoIniciado = eventos.some(ev => ev.tipo_evento === 'INICIO_JOGO');
    if (!this.cronoJogoIniciado || this.cronometroEmExecucao) return;

    const jogoTerminado = eventos.some(ev => ev.tipo_evento === 'FIM_JOGO');
    if (jogoTerminado) {
      this.cronoParteEmCurso = false;
      return;
    }

    // Conta partes distintas (não eventos em bruto) para não ficar sensível a um
    // eventual evento estrutural duplicado (ex: gravado duas vezes por uma
    // repetição automática depois de uma falha de rede).
    const partesIniciadas = new Set(
      eventos.filter(ev => ev.tipo_evento === 'INICIO_JOGO' || ev.tipo_evento === 'INICIO_PARTE').map(ev => ev.id_parte || 1)
    );
    const partesTerminadas = new Set(
      eventos.filter(ev => ev.tipo_evento === 'FIM_PARTE').map(ev => ev.id_parte || 1)
    );
    const numInicios = partesIniciadas.size;
    const numFins = partesTerminadas.size;

    if (numFins >= numInicios) {
      // A última parte iniciada já terminou; aguarda-se que o utilizador carregue
      // em "Iniciar" para começar a parte seguinte (que ainda não tem eventos).
      this.cronoParteEmCurso = false;
      this.cronoParteAtual = Math.min(this.cronoNumeroPartes, numInicios + 1);
      this.cronoTempoAbsoluto = (this.cronoParteAtual - 1) * this.cronoDuracaoSeg();
      this.cronoTempoRestante = this.cronoDuracaoSeg();
    } else {
      // A parte atual já começou e ainda não terminou.
      this.cronoParteEmCurso = true;
      this.cronoParteAtual = Math.max(1, numInicios);
      const inicioParte = (this.cronoParteAtual - 1) * this.cronoDuracaoSeg();
      this.cronoTempoAbsoluto = inicioParte;
      const ultimoEvento = eventos.length ? eventos[eventos.length - 1] : null;
      const tempoConhecido = ultimoEvento ? (ultimoEvento.tempo_segundos || 0) : inicioParte;
      const decorridoNaParte = Math.max(0, tempoConhecido - inicioParte);
      this.cronoTempoRestante = Math.max(0, this.cronoDuracaoSeg() - decorridoNaParte);
    }
  }

  ordenarTimeline(eventos: JogoEventoData[]): JogoEventoData[] {
    return [...eventos].sort((a, b) => this.compararEventos(a, b));
  }

  refletirEstadoEmCampo(): void {
    // Recalcula do zero quem está em campo e quanto tempo cada jogador já jogou
    this.recomputarEstadoJogoDesdeTimeline();

    // Liberta exclusões (cartão azul) cujo tempo já passou
    let absoluto = 0;
    if (this.timeline.length > 0) {
      absoluto = Math.max(...this.timeline.map(ev => ev.tempo_segundos || 0));
    }
    this.jogo.jogadores.forEach(j => {
      if (j.excluidoAteSegundos !== null && j.excluidoAteSegundos !== undefined && j.excluidoAteSegundos <= absoluto) {
        j.excluidoAteSegundos = null;
      }
    });
  }

  iconeEvento(tipo: string): string {
    const mapa: any = {
      GOLO: '⚽', GOLO_SOFRIDO: '🥅', AMARELO: '🟨', AZUL: '🟦', VERMELHO: '🟥',
      FALTA: '🚩', ASSISTENCIA: '🎯', RECUPERACAO_BOLA: '🛡️', PERDA_BOLA: '🔄',
      REMATE: '🎯', SUBSTITUICAO: '🔄', INICIO_JOGO: '▶️', INICIO_PARTE: '⏩',
      FIM_PARTE: '⏸️', FIM_JOGO: '🏁', CORRECAO_TEMPO: '✏️'
    };
    return mapa[tipo] || '📌';
  }

  // ---------------- Indicador "em direto" e filtro da timeline ----------------

  // Verdadeiro quando o jogo está a ser registado em modo cronómetro e ainda não terminou.
  // Usado para mostrar o indicador "EM DIRETO" no resumo do jogo (visível mesmo fora do painel de registo).
  jogoEmDireto(): boolean {
    return this.modoRegisto === 'CRONOMETRO' && this.cronoConfigSalva && this.jogo.estado !== 'CONCLUIDO';
  }

  // Por defeito a timeline só mostra golos, assistências, cartões e o início/fim do
  // jogo; "Ver todos" mostra também substituições, início/fim de parte, etc.
  private readonly tiposTimelinePrincipais = ['GOLO', 'GOLO_SOFRIDO', 'ASSISTENCIA', 'AMARELO', 'AZUL', 'VERMELHO', 'INICIO_JOGO', 'INICIO_PARTE', 'FIM_PARTE', 'FIM_JOGO'];

  eventosTimelineVisiveis(): JogoEventoData[] {
    if (this.timelineFiltroTodos) return this.timeline;
    return this.timeline.filter(ev => this.tiposTimelinePrincipais.includes(ev.tipo_evento));
  }

  alternarFiltroTimeline(): void {
    this.timelineFiltroTodos = !this.timelineFiltroTodos;
  }

  // Jogadores que fizeram parte do 5 (ou 11) inicial — usado para mostrar quem
  // começou o jogo junto ao evento "Início do jogo" na timeline.
  jogadoresTitulares(): JogadorJogoExpandable[] {
    return this.jogo.jogadores.filter(j => j.titular);
  }

  // ---------------- Repercussões de um evento da timeline nas estatísticas do jogo ----------------

  // Mapeia um tipo de evento da timeline para a categoria/key usados por alterarGolo/
  // alterarCartao/alterarEstatistica, de forma a poder aplicar ou reverter o seu efeito.
  private mapearEventoParaEstatistica(ev: JogoEventoData): { categoria: 'golos' | 'cartoes' | 'mais'; key: string; marcado?: boolean } | null {
    const tipo = ev.tipo_evento;
    if (tipo === 'GOLO') return { categoria: 'golos', key: ev.detalhe || 'normal', marcado: true };
    if (tipo === 'GOLO_SOFRIDO') return { categoria: 'golos', key: ev.detalhe || 'normal', marcado: false };
    if (tipo === 'AMARELO') return { categoria: 'cartoes', key: 'amarelo' };
    if (tipo === 'AZUL') return { categoria: 'cartoes', key: 'azul' };
    if (tipo === 'VERMELHO') return { categoria: 'cartoes', key: 'vermelho' };
    const maisMapa: any = {
      ASSISTENCIA: 'assistencias',
      RECUPERACAO_BOLA: 'recuperacoes_bola',
      PERDA_BOLA: 'perdas_bola',
      REMATE: 'remates',
      FALTA: 'faltas',
      PENALTY_DEFESA: 'penalty_defesa',
      LD_DEFESA: 'ld_defesa',
      PENALTY_FALHADO: 'penalty_falhado',
      LD_FALHADO: 'ld_falhado'
    };
    if (maisMapa[tipo]) return { categoria: 'mais', key: maisMapa[tipo] };
    return null;
  }

  /**
   * Aplica (sinal=1) ou reverte (sinal=-1) o efeito de um evento da timeline nas
   * estatísticas do jogo e do jogador — golos, cartões, assistências, etc. Um cartão
   * azul também aplica/remove a exclusão temporária do jogador, com base no tempo do evento.
   */
  aplicarEfeitoEvento(ev: JogoEventoData, sinal: 1 | -1): void {
    if (!ev.id_jogador) return;
    const jogador = this.jogo.jogadores.find(j => j.id_jogador === ev.id_jogador);
    if (!jogador) return;

    const mapa = this.mapearEventoParaEstatistica(ev);
    if (mapa) {
      if (mapa.categoria === 'golos') {
        this.alterarGolo(jogador, mapa.key, !!mapa.marcado, sinal);
      } else if (mapa.categoria === 'cartoes') {
        this.alterarCartao(jogador, mapa.key, sinal);
      } else if (mapa.categoria === 'mais') {
        this.alterarEstatistica(jogador, mapa.key, sinal);
      }
    }

    // Exclusão temporária associada a um cartão azul: ao acrescentar, calcula o fim da
    // exclusão a partir do tempo do próprio evento; ao remover, liberta a exclusão.
    if (ev.tipo_evento === 'AZUL') {
      if (sinal > 0) {
        jogador.excluidoAteSegundos = (ev.tempo_segundos || 0) + (this.cronoExclusaoAzulSeg || 120);
      } else {
        jogador.excluidoAteSegundos = null;
      }
    }
  }

  descreverEvento(ev: JogoEventoData): string {
    const detalhe = ev.detalhe ? ` (${ev.detalhe})` : '';
    const equipa = ev.id_equipa === 1 ? ' [Adversário]' : '';
    switch (ev.tipo_evento) {
      case 'GOLO': return `Golo${detalhe}${equipa} de ${ev.nome_jogador || ''}`;
      case 'GOLO_SOFRIDO': return `Golo sofrido${detalhe}${equipa} (${ev.nome_jogador || ''})`;
      case 'AMARELO':
      case 'AZUL':
      case 'VERMELHO':
        return `${ev.tipo_evento} — ${ev.nome_jogador || ''}`;
      case 'SUBSTITUICAO':
        return `Entra ${ev.nome_jogador || ''} → Sai ${ev.nome_jogador_secundario || ''}`;
      case 'INICIO_JOGO': return 'Início do jogo';
      case 'INICIO_PARTE': return `Início da parte ${ev.id_parte}`;
      case 'FIM_PARTE': return `Fim da parte ${ev.id_parte}`;
      case 'FIM_JOGO': return 'Fim do jogo';
      case 'CORRECAO_TEMPO': return `Correção de tempo${detalhe} — ${ev.nome_jogador || ''}`;
      case 'FALTA': return `Falta — ${ev.nome_jogador || ''}`;
      case 'ASSISTENCIA': return `Assistência — ${ev.nome_jogador || ''}`;
      case 'RECUPERACAO_BOLA': return `Recuperação — ${ev.nome_jogador || ''}`;
      case 'PERDA_BOLA': return `Perda de bola — ${ev.nome_jogador || ''}`;
      case 'REMATE': return `Remate — ${ev.nome_jogador || ''}`;
      case 'PENALTY_FALHADO': return `Penalty falhado — ${ev.nome_jogador || ''}`;
      case 'PENALTY_DEFESA': return `Penalty defendido — ${ev.nome_jogador || ''}`;
      case 'LD_FALHADO': return `Livre direto falhado — ${ev.nome_jogador || ''}`;
      case 'LD_DEFESA': return `Livre direto defendido — ${ev.nome_jogador || ''}`;
      default: return `${ev.tipo_evento}${detalhe} — ${ev.nome_jogador || ''}`;
    }
  }

  // ---------------- Substituições ----------------

  abrirModalSubstituicao(): void {
    if (!this.cronoJogoIniciado) {
      alert('Inicia o jogo (cronómetro) antes de fazer substituições.');
      return;
    }
    this.substituicaoEntraSelecionados = [];
    this.substituicaoSaiSelecionados = [];
    this.mostrarModalSubstituicao = true;
  }

  // Alterna a seleção de um jogador (multi-seleção) numa das duas listas do
  // modal de substituição — permite preparar várias substituições de uma vez.
  toggleSelecaoSai(idJogador: number): void {
    const i = this.substituicaoSaiSelecionados.indexOf(idJogador);
    if (i >= 0) this.substituicaoSaiSelecionados.splice(i, 1);
    else this.substituicaoSaiSelecionados.push(idJogador);
  }

  toggleSelecaoEntra(idJogador: number): void {
    const i = this.substituicaoEntraSelecionados.indexOf(idJogador);
    if (i >= 0) this.substituicaoEntraSelecionados.splice(i, 1);
    else this.substituicaoEntraSelecionados.push(idJogador);
  }

  jogadoresEmCampo(): JogadorJogoExpandable[] {
    return this.jogo.jogadores.filter(j => j.emCampo && j.estado === 'CONVOCADO');
  }

  jogadoresBanco(): JogadorJogoExpandable[] {
    return this.jogo.jogadores.filter(j => !j.emCampo && j.estado === 'CONVOCADO');
  }

  // Ordem de apresentação no painel de registo: em modo cronómetro, os jogadores
  // que estão em campo aparecem primeiro (mantendo a ordem relativa dentro de cada grupo).
  jogadoresParaRegisto(): JogadorJogoExpandable[] {
    if (this.modoRegisto !== 'CRONOMETRO' || !this.cronoConfigSalva) {
      return this.jogo.jogadores;
    }
    return [...this.jogo.jogadores].sort((a, b) => {
      const aEmCampo = !!a.emCampo;
      const bEmCampo = !!b.emCampo;
      if (aEmCampo === bEmCampo) return 0;
      return aEmCampo ? -1 : 1;
    });
  }

  confirmarSubstituicao(): void {
    const saem = this.substituicaoSaiSelecionados;
    const entram = this.substituicaoEntraSelecionados;

    if (saem.length === 0 || entram.length === 0) {
      alert('Seleciona pelo menos um jogador que sai e um que entra.');
      return;
    }
    if (saem.length !== entram.length) {
      alert(`Tens ${saem.length} a sair e ${entram.length} a entrar — os números têm de ser iguais.`);
      return;
    }

    const pares = saem.map((idSai, i) => ({ idSai, idEntra: entram[i] }));

    // Fecha o modal já — a atualização otimista local (quem fica em campo, o
    // tempo de jogo de cada um) acontece de imediato a seguir, por isso não há
    // razão para o árbitro esperar pelas chamadas ao servidor até o modal
    // fechar. As substituições continuam a ser processadas e confirmadas em
    // segundo plano.
    this.mostrarModalSubstituicao = false;
    this.substituicaoSaiSelecionados = [];
    this.substituicaoEntraSelecionados = [];

    // Substituições no intervalo (jogo já começou, mas a parte atual ainda não
    // foi iniciada) continuam totalmente permitidas e NÃO arrancam o
    // cronómetro sozinhas — só trocam quem vai estar em campo quando a parte
    // for mesmo iniciada, através do botão "Iniciar".
    this.processarSubstituicoes(pares, 0);
  }

  private processarSubstituicoes(pares: { idSai: number; idEntra: number }[], indice: number): void {
    if (indice >= pares.length) {
      // Todas as substituições foram confirmadas no servidor: atualiza tudo de uma vez.
      this.recarregarTimeline();
      this.refletirEstadoEmCampo();
      this.recarregarTempos();
      return;
    }

    const par = pares[indice];
    if (par.idSai === par.idEntra) {
      // Par inválido (não deveria acontecer, já que as listas são disjuntas) — ignora e avança.
      this.processarSubstituicoes(pares, indice + 1);
      return;
    }

    // Atualização otimista e imediata: pára a contagem de quem sai e arranca já a
    // contagem de quem entra (a acrescentar a qualquer tempo que já tivesse
    // acumulado antes), sem esperar pela confirmação do backend. Só conta tempo
    // de facto se a parte já estiver a decorrer — no intervalo, isto só troca
    // quem está em campo.
    const jSai = this.jogo.jogadores.find(j => j.id_jogador === par.idSai);
    const jEntra = this.jogo.jogadores.find(j => j.id_jogador === par.idEntra);
    if (jSai) jSai.emCampo = false;
    if (jEntra) jEntra.emCampo = true;
    if (this.cronoParteEmCurso) {
      this.registarSaidaJogador(par.idSai);
      this.registarEntradaJogador(par.idEntra);
    }

    const ev: JogoEventoData = {
      id_jogo: this.idJogo,
      id_parte: this.cronoParteAtual,
      tempo_evento: this.cronoTempoDisplay,
      tempo_segundos: this.cronoAbsolutoAtual(),
      tipo_evento: 'SUBSTITUICAO',
      id_jogador: par.idEntra,
      id_jogador_secundario: par.idSai,
      detalhe: null,
      obs: 'Substituição'
    };
    this.jogoService.registarEvento(ev).subscribe({
      next: () => {
        this.processarSubstituicoes(pares, indice + 1);
      },
      error: (err) => {
        console.error('Erro ao registar substituição', err);
        alert('Erro ao registar uma das substituições. As restantes não foram processadas.');
        this.recarregarTimeline();
      }
    });
  }

  // ---------------- Tempos de jogo ----------------

  recarregarTempos(): void {
    this.jogoService.getTemposJogo(this.idJogo).subscribe({
      next: (dados: any[]) => {
        this.temposJogo = (dados || []).map(j => ({ ...j, isGR: !!j.gr, expanded: false, expandedView: false }));
        // Inicializa o tempo em jogo.jogadores (fonte usada para o incremento em tempo real)
        // apenas quando ainda não existe valor local, para não sobrepor o incremento ao vivo.
        this.temposJogo.forEach(tj => {
          const jogador = this.jogo.jogadores.find(j => j.id_jogador === tj.id_jogador);
          if (jogador && (jogador.tempoJogoSegundos === undefined || jogador.tempoJogoSegundos === null)) {
            jogador.tempoJogoSegundos = tj.tempoJogoSegundos || 0;
          }
        });
      },
      error: (err) => console.error('Erro ao carregar tempos', err)
    });
  }

  formatarTempoSegundos(seg: number): string {
    return this.cronoFormatar(seg);
  }

  tempoExclusaoRestante(jogador: JogadorJogoExpandable): string {
    const ate = jogador.excluidoAteSegundos;
    if (ate === null || ate === undefined) return '';
    const restante = ate - this.cronoAbsolutoAtual();
    if (restante <= 0) {
      return '🔓 Disponível';
    }
    return `⏳ ${this.cronoFormatar(restante)}`;
  }

  contarTitulares(): number {
    return this.jogo.jogadores.filter(j => j.titular).length;
  }

  jogadoresEmJogo(): JogadorJogoExpandable[] {
    return this.temposJogo.filter(j => j.emCampo || j.titular);
  }

  getJogadoresExcluidos(): JogadorJogoExpandable[] {
    return this.jogo.jogadores.filter(j =>
      j.estado === 'CONVOCADO' &&
      j.excluidoAteSegundos !== null && j.excluidoAteSegundos !== undefined &&
      j.excluidoAteSegundos > this.cronoAbsolutoAtual());
  }

  // ---------------- Editar evento ----------------

  eventoOriginalAntesEdicao: JogoEventoData | null = null;

  abrirEditarEvento(ev: JogoEventoData): void {
    // Guarda uma cópia do evento tal como estava, para poder reverter o seu efeito
    // nas estatísticas caso a edição altere o tipo, o jogador ou o detalhe.
    this.eventoOriginalAntesEdicao = { ...ev };
    this.eventoEmEdicao = { 
      ...ev, 
      id_parte: ev.id_parte || 1, 
      detalhe: ev.detalhe || '', 
      obs: ev.obs || '',
      id_equipa: ev.id_equipa ?? 0
    };
    this.mostrarModalEvento = true;
  }

  guardarEdicaoEvento(): void {
    if (!this.eventoEmEdicao) return;
    const ev = this.eventoEmEdicao;

    // Recalcula o tempo absoluto (tempo_segundos) a partir do tempo indicado (MM:SS)
    // e da parte, para a ordenação da timeline e as contas de tempo ficarem corretas
    // mesmo depois de uma correção manual do tempo ou da parte.
    const segundosNaParte = this.parseMMSS(ev.tempo_evento || '');
    if (segundosNaParte < 0) {
      alert('Tempo inválido. Usa o formato MM:SS.');
      return;
    }
    const parte = ev.id_parte && ev.id_parte > 0 ? ev.id_parte : 1;
    ev.tempo_segundos = (parte - 1) * this.cronoDuracaoSeg() + segundosNaParte;

    // Numa substituição, garante que os dois jogadores fazem sentido antes de gravar,
    // para as contas de tempo em campo ficarem bem contabilizadas.
    if (ev.tipo_evento === 'SUBSTITUICAO') {
      if (!ev.id_jogador || !ev.id_jogador_secundario) {
        alert('Numa substituição tens de indicar quem entra e quem sai.');
        return;
      }
      if (ev.id_jogador === ev.id_jogador_secundario) {
        alert('O jogador que entra não pode ser o mesmo que sai.');
        return;
      }
    }

    this.jogoService.editarEvento(ev).subscribe({
      next: (ok) => {
        if (ok) {
          this.mostrarModalEvento = false;
          // Reverte o efeito do evento tal como estava antes, e aplica o efeito
          // da versão editada — assim uma alteração de golo, cartão ou exclusão
          // fica sempre corretamente refletida nas estatísticas do jogo.
          if (this.eventoOriginalAntesEdicao) {
            this.aplicarEfeitoEvento(this.eventoOriginalAntesEdicao, -1);
          }
          this.aplicarEfeitoEvento(ev, 1);
          this.eventoEmEdicao = null;
          this.eventoOriginalAntesEdicao = null;
          // Recarrega a timeline e recalcula do zero quem está em campo e os tempos
          // de jogo de cada atleta — essencial quando se edita uma substituição.
          this.recarregarTimeline();
        } else {
          alert('Não foi possível editar o evento.');
        }
      },
      error: (err) => {
        console.error('Erro ao editar evento', err);
        alert('Erro ao editar o evento.');
      }
    });
  }

  eliminarEventoTimeline(ev: JogoEventoData): void {
    if (!ev.id) return;
    if (!confirm('Queres mesmo eliminar este evento?')) return;
    this.jogoService.eliminarEvento(ev.id).subscribe({
      next: (ok) => {
        if (ok) {
          // Reverte o efeito do evento eliminado: retira o golo/cartão do jogador
          // e do jogo, e liberta a exclusão se for o caso de um cartão azul.
          this.aplicarEfeitoEvento(ev, -1);
          // Recarrega a timeline e recalcula do zero o estado em campo e os tempos.
          this.recarregarTimeline();
        }
      },
      error: (err) => console.error('Erro ao eliminar evento', err)
    });
  }

  // ---------------- Adicionar evento manualmente à timeline ----------------

  novoEvento: JogoEventoData | null = null;
  mostrarModalNovoEvento: boolean = false;

  abrirNovoEvento(): void {
    this.novoEvento = {
      id_jogo: this.idJogo,
      id_parte: this.cronoParteAtual,
      tempo_evento: this.cronoTempoDisplay,
      tempo_segundos: this.cronoAbsolutoAtual(),
      tipo_evento: 'GOLO',
      id_jogador: 0,
      id_jogador_secundario: 0,
      detalhe: '',
      obs: '',
      id_equipa: 0
    };
    this.mostrarModalNovoEvento = true;
  }

  guardarNovoEvento(): void {
    if (!this.novoEvento) return;
    const ev = this.novoEvento;

    const segundosNaParte = this.parseMMSS(ev.tempo_evento || '');
    if (segundosNaParte < 0) {
      alert('Tempo inválido. Usa o formato MM:SS.');
      return;
    }
    const parte = ev.id_parte && ev.id_parte > 0 ? ev.id_parte : 1;
    ev.tempo_segundos = (parte - 1) * this.cronoDuracaoSeg() + segundosNaParte;

    if (ev.tipo_evento === 'SUBSTITUICAO') {
      if (!ev.id_jogador || !ev.id_jogador_secundario) {
        alert('Numa substituição tens de indicar quem entra e quem sai.');
        return;
      }
      if (ev.id_jogador === ev.id_jogador_secundario) {
        alert('O jogador que entra não pode ser o mesmo que sai.');
        return;
      }
    }

    this.jogoService.registarEvento(ev).subscribe({
      next: () => {
        this.mostrarModalNovoEvento = false;
        // Aplica o efeito do novo evento — golo, cartão, exclusão, etc. — de
        // acordo com o tempo indicado.
        this.aplicarEfeitoEvento(ev, 1);
        this.novoEvento = null;
        // A timeline é recarregada e o estado em campo / tempos de jogo são
        // recalculados automaticamente a partir do novo evento.
        this.recarregarTimeline();
      },
      error: (err) => {
        console.error('Erro ao adicionar evento', err);
        alert('Erro ao adicionar o evento.');
      }
    });
  }

  cancelarNovoEvento(): void {
    this.mostrarModalNovoEvento = false;
    this.novoEvento = null;
  }

  parseMMSS(texto: string): number {
    const limpo = (texto || '').trim();
    const partes = limpo.split(':');
    if (partes.length === 2) {
      const m = parseInt(partes[0], 10);
      const s = parseInt(partes[1], 10);
      if (!isNaN(m) && !isNaN(s) && m >= 0 && s >= 0 && s < 60) {
        return m * 60 + s;
      }
    }
    const soNumero = parseInt(limpo, 10);
    if (!isNaN(soNumero) && soNumero >= 0) {
      return soNumero;
    }
    return -1;
  }
}
