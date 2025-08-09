import { Component, OnInit } from '@angular/core';
import { EquipaService } from '../../services/equipa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'gestao-equipa-cmp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestao-equipa.component.html',
  styleUrls: ['./gestao-equipa.component.css']
})
export class GestaoEquipaComponent implements OnInit {
  equipa: EquipaData = {
    id: 0,
    epoca: '',
    escalao: '',
    password: '',
    jogadores: [],
    staff: []
  };
  loading = true;
  mostrarModalJogadores = false;
  jogadoresDisponiveis: any[] = [];
  idEquipa = 0;

  constructor(
    private equipaService: EquipaService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    const routeParams = this.route.snapshot.paramMap;
    this.idEquipa = Number(routeParams.get('idEquipa'));
    console.log('GestaoEquipaComponent | ID da equipa:', this.idEquipa);
    this.carregarEquipa(this.idEquipa);

    console.log('GestaoEquipaComponent | ID da equipa _final:', this.equipa);
  }

  carregarEquipa(idEquipa: number) {
    if (idEquipa > 0) {
      this.equipaService.getEquipabyIDLight(idEquipa.toString()).subscribe((data: EquipaData) => {
        this.equipa = data;
        console.log('GestaoEquipaComponent | Equipa (ID > 0):', this.equipa);
      });
    } else {
      this.equipa = this.equipaService.getEquipa();
      console.log('GestaoEquipaComponent | Equipa (ID <= 0):', this.equipa);
    }
    console.log('GestaoEquipaComponent | Equipa:', this.equipa);
    this.loading = false;
  }

  abrirModalJogadores() {


    this.router.navigate(['/jogadorSeleccao/' + this.equipa.id * -1]);
  }

  abrirModalStaff() {

    this.router.navigate(['/staffSeleccao/' + this.equipa.id * -1]);
  }

  fecharModalJogadores() {
    this.mostrarModalJogadores = false;
  }

  verFichaJogador(id: number) {
    this.router.navigate(['/fichaJogador/' + id]);
  }
  verFichaStaff(id: number) {
    this.router.navigate(['/fichaStaff/' + id]);
  }

  seleccionarJogador(jogador: any) {

    if (!jogador?.id) {
      console.error('Jogador sem ID válido:', jogador);
      return;
    }

    this.equipa.jogadores.push(jogador);

    this.fecharModalJogadores();

  }

  apagarJogador(id: number) {
    if (confirm('Tem a certeza que deseja remover este jogador?')) {
      const jogador = this.equipa.jogadores.find((j: any) => j.id === id);
      if (!jogador) {
        alert('Jogador não encontrado na equipa.');
        return;
      }
      this.equipaService.removeJogadorEquipa(jogador).subscribe({
        next: () => {
          this.equipa.jogadores = this.equipa.jogadores.filter((j: any) => j.id !== id);
        },
        error: (error) => {
          console.error('Erro ao remover:', error);
          alert('Ocorreu um erro ao remover o jogador');
        }
      });
    }
  }

  apagarStaff(id: number) {
    if (confirm('Tem a certeza que deseja remover este elemento staff?')) {
      const staff = this.equipa.staff.find((j: any) => j.id === id);
      if (!staff) {
        alert('Staff não encontrado na equipa.');
        return;
      }
      this.equipaService.removeStaffEquipa(staff).subscribe({
        next: () => {
          this.equipa.staff = this.equipa.staff.filter((j: any) => j.id !== id);
        },
        error: (error) => {
          console.error('Erro ao remover:', error);
          alert('Ocorreu um erro ao remover o staff');
        }
      });
    }
  }
}
