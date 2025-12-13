import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartTypeRegistry } from 'chart.js'; // Importar ChartTypeRegistry
import { EquipaService } from '../../services/equipa.service';
import { PresencaService } from '../../services/presenca.service';
import { JogoService } from '../../services/jogo.service';
import { EquipaData } from '../equipa/equipaData';
import { JogoData } from '../lista-jogos/jogoData';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

   equipaData!: EquipaData;
   idEquipa: string | null;
   numberOfTrainings: number = 0;
   avgAthletesPerTraining: number = 0;
   absencePercentage: number = 0;

   // Game indicators
   avgGoalsPerGame: number = 0;
   gamesPerCompetition: { [competition: string]: number } = {};
   goalsScoredPerCompetition: { [competition: string]: number } = {};
   goalsSufferedPerCompetition: { [competition: string]: number } = {};
   totalGamesPlayed: number = 0;
   wins: number = 0;
   draws: number = 0;
   losses: number = 0;

   // Team filter
   selectedTeamFilter: string = 'all'; // 'all', 'A', 'B'
   availableTeams: string[] = [];
   showTeamFilter: boolean = false;

   trainingsPerMonthData: any;
   attendanceDistributionData: any;

   trainingsChart: Chart<'bar', number[]> | undefined; // Ajuste a tipagem
   attendanceChart: Chart<'doughnut', number[]> | undefined; // Ajuste a tipagem

   loading_numberOfTrainings: boolean = false;
   loading_avgAthletesPerTraining: boolean = false;
   loading_absencePercentage: boolean = false;
   loading_gameIndicators: boolean = false;

  constructor(
    private equipaService: EquipaService,
    private presencaService: PresencaService,
    private jogoService: JogoService
  ) {
    this.idEquipa = localStorage.getItem("idequipa_escalao");

  }

  ngOnInit(): void {

    this.loading_numberOfTrainings = true;
    this.loading_avgAthletesPerTraining = true;
    this.loading_absencePercentage = true;
    this.loading_gameIndicators = true;

    this.equipaData = this.equipaService.getEquipa();

    if (this.equipaData == undefined || this.equipaData.id == 0) {
      console.log("DashboardComponent | equipa3", this.equipaData);

      this.equipaService.getEquipabyIDLight(this.idEquipa).subscribe(
        {
          next: data => {
            this.equipaData = data;
            this.equipaData.jogadores.sort((a, b) => (a.data_nascimento - b.data_nascimento));
            console.log("DashboardComponent | carregou equipa", this.equipaData);

            this.equipaService.setEquipa(this.equipaData);

            if (data != null) {
              this.loadTrainingData();
              this.loadGameData();
            } else {

            }
          },
          error: error => {
            console.log("DashboardComponent | Serviço Login Erro!!");

          }
        });
    } else {
      this.loadTrainingData();
      this.loadGameData();

    }


  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    if (this.trainingsChart) {
      this.trainingsChart.destroy();
    }
    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }
  }

  loadTrainingData(): void {
    this.presencaService.getTotalTrainings(this.equipaData.id).subscribe((total: number) => {
      this.numberOfTrainings = total;
      this.loading_numberOfTrainings = false;
    });

    this.presencaService.getAverageAthletesPerTraining(this.equipaData.id).subscribe((avg: number) => {
      this.avgAthletesPerTraining = avg;
      this.loading_avgAthletesPerTraining = false;
    });

    this.presencaService.getAbsencePercentage(this.equipaData.id).subscribe((percent: number) => {
      this.absencePercentage = percent;
      this.loading_absencePercentage = false;
    });
  }

  loadGameData(): void {
    this.jogoService.getAllJogosByEquipa(this.equipaData.id).subscribe((jogos: JogoData[]) => {
      console.log('Dashboard | Jogos recebidos:', jogos);
      this.calculateGameIndicators(jogos);
      this.loading_gameIndicators = false;
    });
  }

  calculateGameIndicators(jogos: JogoData[]): void {
    console.log('Dashboard | Calculando indicadores para jogos:', jogos.length);
    console.log('Dashboard | Primeiro jogo exemplo:', jogos[0]);

    // Check all possible estado values
    const estados = [...new Set(jogos.map(j => j.estado))];
    console.log('Dashboard | Estados encontrados:', estados);

    // Filter games that are NOT in "registado" state (exclude only registered/planned games)
    // But also ensure they have scores to be considered valid
    const validGames = jogos.filter(jogo =>
      (jogo.estado == 'CONCLUIDO') &&
      (jogo.golos_equipa !== null && jogo.golos_equipa !== undefined &&
       jogo.golos_equipa_adv !== null && jogo.golos_equipa_adv !== undefined)
    );
    console.log('Dashboard | Jogos válidos (não registados + com pontuação):', validGames.length);

    let finalValidGames = validGames;

    // Check available teams and decide whether to show filter
    const teamTypes = [...new Set(finalValidGames.map((j: JogoData) => j.tipoEquipa).filter((t: string) => t))];
    console.log('Dashboard | Tipos de equipa encontrados:', teamTypes);

    // Show filter only if there are both A and B teams (or if B team exists)
    const hasTeamB = teamTypes.some((t: string) => t === 'B' || t === 'b');
    this.showTeamFilter = hasTeamB && finalValidGames.length > 0;
    this.availableTeams = this.showTeamFilter ? ['A', 'B'] : [];

    // Reset filter to 'all' if no team filter should be shown
    if (!this.showTeamFilter) {
      this.selectedTeamFilter = 'all';
    }

    // Filter by selected team if not 'all'
    let filteredGames = finalValidGames;
    if (this.selectedTeamFilter !== 'all') {
      if (this.selectedTeamFilter === 'A') {
        // Equipa A é tudo que não é Equipa B
        filteredGames = finalValidGames.filter((jogo: JogoData) => jogo.tipoEquipa !== 'B' && jogo.tipoEquipa !== 'b');
      } else if (this.selectedTeamFilter === 'B') {
        // Equipa B é explicitamente marcado como B
        filteredGames = finalValidGames.filter((jogo: JogoData) => jogo.tipoEquipa === 'B' || jogo.tipoEquipa === 'b');
      }
      console.log('Dashboard | Jogos filtrados por equipa:', filteredGames.length, 'tipo:', this.selectedTeamFilter);
    }

    this.totalGamesPlayed = filteredGames.length;
    this.wins = filteredGames.filter((jogo: JogoData) => jogo.golos_equipa > jogo.golos_equipa_adv).length;
    this.draws = filteredGames.filter((jogo: JogoData) => jogo.golos_equipa === jogo.golos_equipa_adv).length;
    this.losses = filteredGames.filter((jogo: JogoData) => jogo.golos_equipa < jogo.golos_equipa_adv).length;

    console.log('Dashboard | Total jogos jogados:', this.totalGamesPlayed);
    console.log('Dashboard | Vitórias:', this.wins, 'Empates:', this.draws, 'Derrotas:', this.losses);

    // Calculate average goals per game
    if (filteredGames.length > 0) {
      const totalGoals = filteredGames.reduce((sum: number, jogo: JogoData) => sum + (jogo.golos_equipa || 0), 0);
      this.avgGoalsPerGame = totalGoals / filteredGames.length;
      console.log('Dashboard | Média golos por jogo:', this.avgGoalsPerGame);
    } else {
      this.avgGoalsPerGame = 0;
    }

    // Calculate games per competition
    this.gamesPerCompetition = {};
    filteredGames.forEach((jogo: JogoData) => {
      const comp = jogo.competicao_nome || 'Sem Competição';
      this.gamesPerCompetition[comp] = (this.gamesPerCompetition[comp] || 0) + 1;
    });
    console.log('Dashboard | Jogos por competição:', this.gamesPerCompetition);

    // Calculate goals scored and suffered per competition
    this.goalsScoredPerCompetition = {};
    this.goalsSufferedPerCompetition = {};
    filteredGames.forEach((jogo: JogoData) => {
      const comp = jogo.competicao_nome || 'Sem Competição';
      this.goalsScoredPerCompetition[comp] = (this.goalsScoredPerCompetition[comp] || 0) + (jogo.golos_equipa || 0);
      this.goalsSufferedPerCompetition[comp] = (this.goalsSufferedPerCompetition[comp] || 0) + (jogo.golos_equipa_adv || 0);
    });
    console.log('Dashboard | Golos marcados por competição:', this.goalsScoredPerCompetition);
    console.log('Dashboard | Golos sofridos por competição:', this.goalsSufferedPerCompetition);
  }

  setTeamFilter(filter: string): void {
    console.log('Dashboard | Filtro alterado para:', filter);
    this.selectedTeamFilter = filter;
    this.loading_gameIndicators = true;
    // Reload data and recalculate with new filter
    this.jogoService.getAllJogosByEquipa(this.equipaData.id).subscribe((jogos: JogoData[]) => {
      console.log('Dashboard | Recarregando dados após mudança de filtro');
      this.calculateGameIndicators(jogos);
      this.loading_gameIndicators = false;
    });
  }

  onTeamFilterChange(): void {
    // This method is kept for backward compatibility but now uses setTeamFilter
    this.setTeamFilter(this.selectedTeamFilter);
  }

  getTotalGoalsScored(): number {
    return Object.values(this.goalsScoredPerCompetition).reduce((sum, goals) => sum + goals, 0);
  }

  getCompetitionsArray(): { name: string, games: number, goalsScored: number, goalsSuffered: number }[] {
    return Object.keys(this.gamesPerCompetition).map(comp => ({
      name: comp,
      games: this.gamesPerCompetition[comp],
      goalsScored: this.goalsScoredPerCompetition[comp] || 0,
      goalsSuffered: this.goalsSufferedPerCompetition[comp] || 0
    }));
  }

  getTotalGamesPlayed(): number {
    return this.totalGamesPlayed;
  }

  getGoalDifference(): number {
    const totalScored = this.getTotalGoalsScored();
    const totalSuffered = Object.values(this.goalsSufferedPerCompetition).reduce((sum, goals) => sum + goals, 0);
    return totalScored - totalSuffered;
  }

  getWinPercentage(): number {
    if (this.totalGamesPlayed === 0) return 0;
    return (this.wins / this.totalGamesPlayed) * 100;
  }

  getCompetitionsCount(): number {
    return Object.keys(this.gamesPerCompetition).length;
  }

  initializeCharts(): void {
    const trainingsCtx = document.getElementById('trainingsPerMonthChart') as HTMLCanvasElement;
    if (trainingsCtx) {
      this.trainingsChart = new Chart<'bar', number[]>(trainingsCtx, {
        type: 'bar',
        data: this.trainingsPerMonthData || { labels: [], datasets: [] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    const attendanceCtx = document.getElementById('attendanceDistributionChart') as HTMLCanvasElement;
    if (attendanceCtx) {
      this.attendanceChart = new Chart<'doughnut', number[]>(attendanceCtx, {
        type: 'doughnut',
        data: this.attendanceDistributionData || { labels: [], datasets: [] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }
  }

  updateChart(chartInstance: Chart<'bar' | 'doughnut', number[]> | undefined, elementId: string, type: 'bar' | 'doughnut', data: any): void {
    if (chartInstance) {
      chartInstance.data = data;
      chartInstance.update();
    } else {
      const ctx = document.getElementById(elementId) as HTMLCanvasElement;
      if (ctx) {
        if (type === 'bar') {
          this.trainingsChart = new Chart<'bar', number[]>(ctx, {
            type: 'bar',
            data: data,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        } else if (type === 'doughnut') {
          this.attendanceChart = new Chart<'doughnut', number[]>(ctx, {
            type: 'doughnut',
            data: data,
            options: {
              responsive: true,
              maintainAspectRatio: false,
            }
          });
        }
      }
    }
  }
}
