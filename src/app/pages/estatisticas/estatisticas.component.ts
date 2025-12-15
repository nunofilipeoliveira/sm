import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipaService } from '../../services/equipa.service';
import { JogoService } from '../../services/jogo.service';
import { EstatisticaJogador } from './EstatisticasData';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { JogoData, JogadorJogo } from '../lista-jogos/jogoData';
import { EquipaData } from '../equipa/equipaData';

@Component({
  selector: 'estatisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonToggleModule],
  templateUrl: './estatisticas.component.html',
  styleUrl: './estatisticas.component.css'
})
export class EstatisticasComponent implements OnInit {
  estatisticas: EstatisticaJogador[] = [];
  competicoes: string[] = [];
  filtroCompeticao: string = 'todas';
  loading: boolean = true;
  jogos: JogoData[] = [];
  jogosBackup: JogoData[] = [];
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filtro: string = 'todos';
  hasEquipaB: boolean = true;
  startDate: string = '';
  endDate: string = '';
  showDateFilter: boolean = false;
  showAdvanced: boolean = false;

  constructor(private equipaService: EquipaService, private jogoService: JogoService) { }

  ngOnInit(): void {
    this.filtroCompeticao = 'todas';
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.equipaService.ensureEquipaLoaded().subscribe({
      next: (equipa: EquipaData) => {
        if (equipa.id !== undefined) {
          this.jogoService.getAllJogosByEquipa(equipa.id).subscribe({
            next: (jogosLoaded: JogoData[]) => {
              this.jogos = jogosLoaded;
              this.jogosBackup = jogosLoaded;
              this.hasEquipaB = jogosLoaded.some(jogo => jogo.tipoEquipa === 'B');
              if (!this.hasEquipaB) {
                this.filtro = 'todos';
              }
              this.competicoes = [];
              // Collect competitions
              jogosLoaded.forEach(jogo => {
                if (jogo.estado === 'CONCLUIDO' && !this.competicoes.includes(jogo.competicao_nome)) {
                  this.competicoes.push(jogo.competicao_nome);
                }
              });
              // Load players for each completed game
              let completedRequests = 0;
              jogosLoaded.forEach(jogo => {
                if (jogo.estado === 'CONCLUIDO') {
                  this.jogoService.getJogoById(jogo.id).subscribe({
                    next: (jogoCompleto: JogoData) => {
                      jogo.jogadores = jogoCompleto.jogadores;
                      completedRequests++;
                      if (completedRequests === jogosLoaded.filter(j => j.estado === 'CONCLUIDO').length) {
                        this.applyFilters();
                        this.loading = false;
                      }
                    }
                  });
                }
              });
              if (jogosLoaded.filter(j => j.estado === 'CONCLUIDO').length === 0) {
                this.loading = false;
              }
            },
            error: (error) => {
              console.error('Erro ao carregar jogos:', error);
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar equipa:', error);
        this.loading = false;
      }
    });
  }

  calculateEstatisticas(jogosParm: JogoData[]): void {
    const statsMap = new Map<number, EstatisticaJogador>();

    jogosParm.forEach(jogo => {
      if (jogo.estado === 'CONCLUIDO') {
        jogo.jogadores.forEach((jogador: JogadorJogo) => {
          if (!statsMap.has(jogador.id_jogador)) {
            statsMap.set(jogador.id_jogador, {
              id_jogador: jogador.id_jogador,
              nome: jogador.nome,
              jogos: 0,
              golos: 0,
              cartao_amarelo: 0,
              cartao_azul: 0,
              cartao_vermelho: 0,
              // Estatísticas detalhadas de golos
              golos_p: 0,
              golos_ld: 0,
              golos_pp: 0,
              golos_up: 0,
              golos_normal: 0,
              golos_s_p: 0,
              golos_s_ld: 0,
              golos_s_up: 0,
              golos_s_pp: 0,
              golos_s_normal: 0,
              // Estatísticas de jogo
              assistencias: 0,
              recuperacoes_bola: 0,
              perdas_bola: 0,
              remates: 0,
              faltas: 0,
              // Estatísticas específicas
              penalty_defesa: 0,
              ld_defesa: 0,
              penalty_falhado: 0,
              ld_falhado: 0
            });
          }
          const stat = statsMap.get(jogador.id_jogador)!;
          stat.jogos += 1;

          // Estatísticas básicas
          stat.golos += (jogador.golos_normal || 0) + (jogador.golos_p || 0) + (jogador.golos_ld || 0) + (jogador.golos_up || 0) + (jogador.golos_pp || 0);
          stat.cartao_amarelo += jogador.amarelo || 0;
          stat.cartao_azul += jogador.azul || 0;
          stat.cartao_vermelho += jogador.vermelho || 0;

          // Estatísticas detalhadas de golos
          stat.golos_p += jogador.golos_p || 0;
          stat.golos_ld += jogador.golos_ld || 0;
          stat.golos_pp += jogador.golos_pp || 0;
          stat.golos_up += jogador.golos_up || 0;
          stat.golos_normal += jogador.golos_normal || 0;
          stat.golos_s_p += jogador.golos_s_p || 0;
          stat.golos_s_ld += jogador.golos_s_ld || 0;
          stat.golos_s_up += jogador.golos_s_up || 0;
          stat.golos_s_pp += jogador.golos_s_pp || 0;
          stat.golos_s_normal += jogador.golos_s_normal || 0;

          // Estatísticas de jogo
          stat.assistencias += jogador.assistencias || 0;
          stat.recuperacoes_bola += jogador.recuperacoes_bola || 0;
          stat.perdas_bola += jogador.perdas_bola || 0;
          stat.remates += jogador.remates || 0;
          stat.faltas += jogador.faltas || 0;

          // Estatísticas específicas
          stat.penalty_defesa += jogador.penalty_defesa || 0;
          stat.ld_defesa += jogador.ld_defesa || 0;
          stat.penalty_falhado += jogador.penalty_falhado || 0;
          stat.ld_falhado += jogador.ld_falhado || 0;
        });
      }
    });

    this.estatisticas = Array.from(statsMap.values());
    if (this.sortField) {
      this.sortEstatisticas();
    } else {
      this.estatisticas.sort((a, b) => a.nome.localeCompare(b.nome));
    }
  }


  filtrarEquipas() {
    this.applyFilters();
  }

  setFiltro(filtro: string): void {
    this.filtroCompeticao = filtro;
    this.applyFilters();
  }

  onDateChange(): void {
    this.applyFilters();
  }

  toggleDateFilter(): void {
    this.showDateFilter = !this.showDateFilter;
  }

  applyFilters(): void {
    let filteredJogos = this.jogosBackup;

    // Apply team filter
    if (this.filtro === 'equipa_a') {
      filteredJogos = filteredJogos.filter(jogo => jogo.tipoEquipa !== 'B');
    } else if (this.filtro === 'equipa_b') {
      filteredJogos = filteredJogos.filter(jogo => jogo.tipoEquipa === 'B');
    }

    // Apply competition filter
    if (this.filtroCompeticao !== 'todas') {
      filteredJogos = filteredJogos.filter(jogo => jogo.competicao_nome === this.filtroCompeticao);
    }

    // Apply date range filter
    if (this.startDate) {
      const start = new Date(this.startDate);
      filteredJogos = filteredJogos.filter(jogo => new Date(jogo.data) >= start);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      filteredJogos = filteredJogos.filter(jogo => new Date(jogo.data) <= end);
    }

    this.calculateEstatisticas(filteredJogos);
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortEstatisticas();
  }

  sortEstatisticas(): void {
    this.estatisticas.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof EstatisticaJogador];
      let bValue: any = b[this.sortField as keyof EstatisticaJogador];
      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }
}
