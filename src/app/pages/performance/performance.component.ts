import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { EquipaService } from '../../services/equipa.service';
import { PerformanceResumoEquipaData, PerformanceResumoJogadorData, PerformanceService } from '../../services/performance.service';
import { PerformanceConfigService } from '../../services/performance-config.service';
import { StarRatingComponent } from '../../shared/star-rating/star-rating.component';

Chart.register(...registerables);

/** Modos de filtro por período disponíveis na página. */
type FiltroModo = 'epoca' | 'semana' | 'mes' | 'custom';

/**
 * Página de análise de Performance dos atletas nos treinos da equipa.
 * Acesso restrito a ADMIN/TREINADOR (via AuthGuard + RoleGuard na rota /performance).
 *
 * - Layout responsivo, preparado para mobile (lista de cartões expansível).
 * - Filtro por período: época completa, semana atual, mês atual ou datas específicas.
 * - Ao selecionar um atleta, o registo expande e apresenta o gráfico (Chart.js)
 *   da evolução das classificações nos treinos (carregado a pedido).
 */
@Component({
  selector: 'performance',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})
export class PerformanceComponent implements OnInit, OnDestroy {

  // ===== Resumo da equipa =====
  public performanceEquipa: PerformanceResumoEquipaData | null = null;
  public performanceDesativado: boolean = false;
  public loading: boolean = false;
  public sbmError: boolean = false;

  // ===== Filtros de pesquisa =====
  public filtroNome: string = '';
  public ordenacao: 'nome' | 'media' | 'presencas' = 'media';
  public filtroModo: FiltroModo = 'epoca';
  public dataInicioInput: string = '';   // formato yyyy-MM-dd (input type="date")
  public dataFimInput: string = '';      // formato yyyy-MM-dd (input type="date")
  private dataInicioAtiva: number | undefined;   // formato AAAAMMDD (backend)
  private dataFimAtiva: number | undefined;      // formato AAAAMMDD (backend)

  // ===== Detalhe do atleta selecionado (gráfico de evolução) =====
  public jogadorExpandidoId: number | null = null;
  public jogadorDetalhe: PerformanceResumoJogadorData | null = null;
  public detalheLoading: boolean = false;
  public detalheErro: boolean = false;

  @ViewChild('evolucaoCanvas') evolucaoCanvas?: ElementRef<HTMLCanvasElement>;
  private evolucaoChart?: Chart<'line', (number | null)[]>;

  constructor(
    private router: Router,
    private equipaService: EquipaService,
    private performanceService: PerformanceService,
    private perfConfigService: PerformanceConfigService
  ) { }

  ngOnInit(): void {
    this.carregarPerformance();
  }

  ngOnDestroy(): void {
    this.destruirGrafico();
  }

  // ==================== FILTROS DE PERÍODO ====================

  /** Aplica o modo de filtro selecionado e recalcula o intervalo de datas. */
  setFiltroModo(parmModo: FiltroModo): void {
    if (this.filtroModo === parmModo) { return; }
    this.filtroModo = parmModo;

    if (parmModo === 'epoca') {
      this.dataInicioAtiva = undefined;
      this.dataFimAtiva = undefined;
      this.carregarPerformance();
      return;
    }

    const hoje = new Date();

    if (parmModo === 'semana') {
      const segunda = new Date(hoje);
      segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7)); // segunda-feira da semana atual
      const domingo = new Date(segunda);
      domingo.setDate(segunda.getDate() + 6);
      this.dataInicioAtiva = this.converterParaAAAAMMDD(segunda);
      this.dataFimAtiva = this.converterParaAAAAMMDD(domingo);
      this.dataInicioInput = this.converterParaISO(segunda);
      this.dataFimInput = this.converterParaISO(domingo);
    } else if (parmModo === 'mes') {
      const primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      this.dataInicioAtiva = this.converterParaAAAAMMDD(primeiro);
      this.dataFimAtiva = this.converterParaAAAAMMDD(ultimo);
      this.dataInicioInput = this.converterParaISO(primeiro);
      this.dataFimInput = this.converterParaISO(ultimo);
    } else {
      // 'custom': só aplica quando o utilizador preencher as duas datas
      if (!this.dataInicioInput || !this.dataFimInput) {
        const primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        this.dataInicioInput = this.converterParaISO(primeiro);
        this.dataFimInput = this.converterParaISO(hoje);
      }
      this.aplicarFiltroCustom();
      return;
    }

    this.carregarPerformance();
  }

  /** Aplica o intervalo de datas escolhido pelo utilizador (modo custom). */
  aplicarFiltroCustom(): void {
    if (!this.dataInicioInput || !this.dataFimInput) { return; }
    const inicio = new Date(this.dataInicioInput + 'T00:00:00');
    const fim = new Date(this.dataFimInput + 'T00:00:00');
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) { return; }
    if (fim < inicio) { return; }
    this.dataInicioAtiva = this.converterParaAAAAMMDD(inicio);
    this.dataFimAtiva = this.converterParaAAAAMMDD(fim);
    this.carregarPerformance();
  }

  /** Descritivo do filtro ativo, apresentado junto aos filtros. */
  get descritivoFiltro(): string {
    switch (this.filtroModo) {
      case 'semana':
      case 'mes':
        return this.formatarIntervalo(this.dataInicioAtiva, this.dataFimAtiva);
      case 'custom':
        return (this.dataInicioAtiva && this.dataFimAtiva)
          ? this.formatarIntervalo(this.dataInicioAtiva, this.dataFimAtiva)
          : 'Selecione as datas';
      default:
        return 'Época atual';
    }
  }

  classeModo(parmModo: FiltroModo): string {
    return this.filtroModo === parmModo ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary';
  }

  // ==================== DADOS ====================

  carregarPerformance(): void {
    this.loading = true;
    this.sbmError = false;
    this.performanceDesativado = false;
    this.performanceEquipa = null;
    this.fecharJogadorExpandido();

    this.equipaService.ensureEquipaLoaded().subscribe({
      next: (equipa) => {
        if (!equipa || !equipa.id) {
          this.loading = false;
          return;
        }

        // Configuração da equipa: se a funcionalidade de performance estiver
        // desativada, a página não é apresentada (como se não existisse).
        const idEquipaAtiva = equipa.id;
        this.perfConfigService.carregarConfig(idEquipaAtiva);

        this.performanceService.getPerformanceConfig(idEquipaAtiva).subscribe({
          next: (config) => {
            if (config && !(config.permitir_registo && config.permitir_visualizacao)) {
              this.performanceDesativado = true;
              this.loading = false;
              console.log('PerformanceComponent | performance desativada para a equipa, a redirecionar para o dashboard');
              this.router.navigate(['/dashboard']);
              return;
            }
            this.carregarResumoEquipa(idEquipaAtiva);
          },
          error: (error) => {
            // Em caso de erro na configuração, segue com o carregamento
            // (o backend valida novamente a visualização)
            console.error('PerformanceComponent | carregarPerformance | erro ao carregar configuração', error);
            this.carregarResumoEquipa(idEquipaAtiva);
          }
        });
      },
      error: (error) => {
        console.error('PerformanceComponent | carregarPerformance | erro ao carregar equipa', error);
        this.sbmError = true;
        this.loading = false;
      }
    });
  }

  private carregarResumoEquipa(parmIdEquipa: number): void {
    this.performanceService.getPerformanceEquipa(parmIdEquipa, undefined, this.dataInicioAtiva, this.dataFimAtiva).subscribe({
      next: (data) => {
        console.log('PerformanceComponent | carregarPerformance | dados recebidos', data);
        this.performanceEquipa = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('PerformanceComponent | carregarPerformance | erro', error);
        this.sbmError = true;
        this.loading = false;
      }
    });
  }

  /** Devolve os jogadores filtrados por nome e ordenados conforme a ordenação selecionada. */
  getJogadores(): PerformanceResumoJogadorData[] {
    const jogadores = this.performanceEquipa?.jogadores ?? [];
    const termo = this.filtroNome.trim().toLowerCase();
    const filtrados = termo
      ? jogadores.filter(jogador => jogador.nome_jogador.toLowerCase().includes(termo))
      : jogadores.slice();

    switch (this.ordenacao) {
      case 'nome':
        filtrados.sort((a, b) => a.nome_jogador.localeCompare(b.nome_jogador));
        break;
      case 'presencas':
        filtrados.sort((a, b) => b.percentagem_presencas - a.percentagem_presencas);
        break;
      default:
        filtrados.sort((a, b) => (b.media_classificacao ?? -1) - (a.media_classificacao ?? -1));
        break;
    }
    return filtrados;
  }

  // ==================== DETALHE DO ATLETA (EXPANSÃO + GRÁFICO) ====================

  /** Expande/recolhe o registo do atleta. Ao expandir, carrega o histórico a pedido. */
  toggleJogador(parmIdJogador: number): void {
    if (this.jogadorExpandidoId === parmIdJogador) {
      this.fecharJogadorExpandido();
      return;
    }

    this.fecharJogadorExpandido();
    this.jogadorExpandidoId = parmIdJogador;
    this.detalheLoading = true;
    this.detalheErro = false;

    this.performanceService.getPerformanceJogador(parmIdJogador, this.dataInicioAtiva, this.dataFimAtiva).subscribe({
      next: (data) => {
        // Ignora a resposta se o atleta entretanto foi recolhido/trocado
        if (this.jogadorExpandidoId !== parmIdJogador) { return; }
        this.jogadorDetalhe = data;
        this.detalheLoading = false;
        setTimeout(() => this.renderizarGrafico());
      },
      error: (error) => {
        console.error('PerformanceComponent | toggleJogador | erro', error);
        if (this.jogadorExpandidoId !== parmIdJogador) { return; }
        this.detalheErro = true;
        this.detalheLoading = false;
      }
    });
  }

  fecharJogadorExpandido(): void {
    this.jogadorExpandidoId = null;
    this.jogadorDetalhe = null;
    this.detalheLoading = false;
    this.detalheErro = false;
    this.destruirGrafico();
  }

  /** Desenha o gráfico de evolução das classificações (Chart.js). */
  private renderizarGrafico(): void {
    this.destruirGrafico();
    const canvas = this.evolucaoCanvas?.nativeElement;
    const evolucao = this.jogadorDetalhe?.evolucao ?? [];
    if (!canvas || evolucao.length === 0) { return; }

    this.evolucaoChart = new Chart<'line', (number | null)[]>(canvas, {
      type: 'line',
      data: {
        labels: evolucao.map(ponto => this.formatarDataCurta(ponto.data)),
        datasets: [{
          label: 'Classificação',
          data: evolucao.map(ponto => ponto.classificacao ?? null),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.12)',
          pointBackgroundColor: '#0d6efd',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: {
            min: 0,
            max: 5,
            ticks: { stepSize: 1 }
          },
          x: {
            ticks: { maxTicksLimit: 10 }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                const ponto = evolucao[items[0].dataIndex];
                if (!ponto) { return ''; }
                return ponto.hora
                  ? `${this.formatarData(ponto.data)} · ${ponto.hora}`
                  : this.formatarData(ponto.data);
              },
              label: (item) => ` Classificação: ${item.parsed.y}`
            }
          }
        }
      }
    });
  }

  private destruirGrafico(): void {
    if (this.evolucaoChart) {
      this.evolucaoChart.destroy();
      this.evolucaoChart = undefined;
    }
  }

  // ==================== HELPERS DE DATAS ====================

  private converterParaAAAAMMDD(parmData: Date): number {
    return parmData.getFullYear() * 10000 + (parmData.getMonth() + 1) * 100 + parmData.getDate();
  }

  private converterParaISO(parmData: Date): string {
    const mes = String(parmData.getMonth() + 1).padStart(2, '0');
    const dia = String(parmData.getDate()).padStart(2, '0');
    return `${parmData.getFullYear()}-${mes}-${dia}`;
  }

  formatarData(parmData: number): string {
    if (!parmData) { return '-'; }
    const dia = parmData % 100;
    const mes = Math.floor((parmData % 10000) / 100);
    const ano = Math.floor(parmData / 10000);
    return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`;
  }

  private formatarDataCurta(parmData: number): string {
    if (!parmData) { return ''; }
    const dia = parmData % 100;
    const mes = Math.floor((parmData % 10000) / 100);
    return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}`;
  }

  private formatarIntervalo(parmInicio: number | undefined, parmFim: number | undefined): string {
    if (!parmInicio || !parmFim) { return ''; }
    return `${this.formatarDataCurta(parmInicio)} – ${this.formatarDataCurta(parmFim)}`;
  }
}