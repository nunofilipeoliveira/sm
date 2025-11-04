import { Component, OnInit } from '@angular/core';
import { LoginServiceService } from '../../services/login-service.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoricoLoginsPipe } from './historico-logins.pipe';

@Component({
  selector: 'historico-logins',
  standalone: true,
  imports: [CommonModule, FormsModule, HistoricoLoginsPipe],
  templateUrl: './historico-logins.component.html',
  styleUrl: './historico-logins.component.css'
})
export class HistoricoLoginsComponent implements OnInit {

  constructor(private loginws: LoginServiceService, private router: Router) { }

  public historico: historicologinsdata[] = [];
  public filtro_nome: string = "";
  public spinner: boolean = false;

  // New properties for modern design
  public currentDate: Date = new Date();
  public dataInicial: string = "";
  public dataFinal: string = "";
  public viewMode: string = 'table';
  public pageSize: number = 20;
  public currentPage: number = 0;

  // Statistics properties
  public totalUsers: number = 0;
  public totalAccesses: number = 0;
  public todayAccesses: number = 0;
  public weekAccesses: number = 0;

  // User filter properties
  public uniqueUsers: string[] = [];
  public selectedUser: string = '';

  // New mobile-first properties
  public showFilters: boolean = false;
  public statsData: any[] = [];

  ngOnInit() {

    if (this.loginws.getLoginData().user != "Nuno") {
      this.router.navigate(['equipa']);
    }

    this.loadHistoricoData();
  }

  private loadHistoricoData() {
    this.spinner = true;
    this.loginws.getHistoricoLogins().subscribe(
      {
        next: data => {
          this.historico = data || [];
          this.calculateStatistics();
          this.spinner = false;
        },
        error: error => {
          console.log("HistoricoLoginsComponent | carregarhistorico", error);
          this.spinner = false;
        }
      });
  }

  private calculateStatistics() {
    if (!this.historico || this.historico.length === 0) return;

    // Calculate unique users
    const uniqueUsers = new Set(this.historico.map(item => item.nome));
    this.totalUsers = uniqueUsers.size;
    this.uniqueUsers = Array.from(uniqueUsers).sort();

    // Total accesses
    this.totalAccesses = this.historico.length;

    // Today's accesses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayAccesses = this.historico.filter(item => {
      const itemDate = new Date(item.dataHistorico);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    }).length;

    // This week's accesses
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    this.weekAccesses = this.historico.filter(item => {
      const itemDate = new Date(item.dataHistorico);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= weekStart;
    }).length;

    // Prepare stats data for mobile view
    this.statsData = [
      {
        icon: 'fa-users',
        value: this.totalUsers,
        label: 'Utilizadores',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        icon: 'fa-sign-in-alt',
        value: this.totalAccesses,
        label: 'Total',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        icon: 'fa-clock',
        value: this.todayAccesses,
        label: 'Hoje',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        icon: 'fa-calendar-week',
        value: this.weekAccesses,
        label: 'Esta Semana',
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
    ];
  }

  get filteredHistorico(): historicologinsdata[] {
    let filtered = this.historico;

    // Filter by selected user
    if (this.selectedUser && this.selectedUser.trim()) {
      filtered = filtered.filter(item =>
        item.nome.toLowerCase() === this.selectedUser.toLowerCase()
      );
    }

    // Filter by date range
    if (this.dataInicial) {
      const startDate = new Date(this.dataInicial);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dataHistorico);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= startDate;
      });
    }

    if (this.dataFinal) {
      const endDate = new Date(this.dataFinal);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dataHistorico);
        return itemDate <= endDate;
      });
    }

    return filtered;
  }

  nextPage() {
    if ((this.currentPage + 1) * this.pageSize < this.filteredHistorico.length) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  onFilterChange() {
    this.currentPage = 0; // Reset to first page when filtering
  }

  // New mobile-first methods
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'cards' : 'list';
  }

  loadMore() {
    this.currentPage++;
  }

  getUserColor(username: string): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  }

  // Helper method for template
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}
