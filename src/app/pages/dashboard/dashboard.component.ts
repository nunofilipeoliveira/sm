import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartTypeRegistry } from 'chart.js'; // Importar ChartTypeRegistry
import { EquipaService } from '../../services/equipa.service';
import { PresencaService } from '../../services/presenca.service';

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

  trainingsPerMonthData: any;
  attendanceDistributionData: any;

  trainingsChart: Chart<'bar', number[]> | undefined; // Ajuste a tipagem
  attendanceChart: Chart<'doughnut', number[]> | undefined; // Ajuste a tipagem

  loading_numberOfTrainings: boolean = false;
  loading_avgAthletesPerTraining: boolean = false;
  loading_absencePercentage: boolean = false;

  constructor(
    private equipaService: EquipaService,
    private presencaService: PresencaService
  ) {
    this.idEquipa = localStorage.getItem("idequipa_escalao");

  }

  ngOnInit(): void {

    this.loading_numberOfTrainings = true;
    this.loading_avgAthletesPerTraining = true;
    this.loading_absencePercentage = true;

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
              this.presencaService.getTotalTrainings(this.equipaData.id).subscribe((total: number) => {
                this.numberOfTrainings = total;
                this.loading_numberOfTrainings = false
              });

              this.presencaService.getAverageAthletesPerTraining(this.equipaData.id).subscribe((avg: number) => {
                this.avgAthletesPerTraining = avg;
                this.loading_avgAthletesPerTraining = false;
              });

              this.presencaService.getAbsencePercentage(this.equipaData.id).subscribe((percent: number) => {
                this.absencePercentage = percent;
                this.loading_absencePercentage = false;
              });

              this.loadDashboardData();
            } else {

            }
          },
          error: error => {
            console.log("DashboardComponent | Serviço Login Erro!!");

          }
        });
    } else {
      this.presencaService.getTotalTrainings(this.equipaData.id).subscribe((total: number) => {
        this.numberOfTrainings = total;
      });
      this.loadDashboardData();
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

  loadDashboardData(): void {
    // Carregar dados para os cards e gráficos
    // (métodos de carregamento de dados aqui)
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
