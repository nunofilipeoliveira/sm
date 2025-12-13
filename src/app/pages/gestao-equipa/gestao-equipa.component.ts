import { Component, OnInit } from '@angular/core';
import { EquipaService } from '../../services/equipa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JogadorSeleccaoComponent } from '../jogador-seleccao/jogador-seleccao.component';
import { EquipaData } from '../equipa/equipaData';

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
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) { }

  ngOnInit() {

    this.loading = true;
    const routeParams = this.route.snapshot.paramMap;
    this.idEquipa = Number(routeParams.get('idEquipa'));
    console.log('GestaoEquipaComponent | ID da equipa:', this.idEquipa);

    // Inicializar equipa com valores padrão se necessário
    if (!this.equipa) {
      this.equipa = {
        id: 0,
        epoca: '',
        escalao: '',
        password: '',
        jogadores: [],
        staff: []
      };
    }

    this.carregarEquipa(this.idEquipa);

    console.log('GestaoEquipaComponent | ID da equipa _final:', this.equipa);
  }

  carregarEquipa(idEquipa: number) {
    if (idEquipa > 0) {
      this.equipaService.getEquipabyIDLight(idEquipa.toString()).subscribe((data: EquipaData) => {
        this.equipa = data;
        console.log('GestaoEquipaComponent | Equipa (ID > 0):', this.equipa);
         this.loading = false;
      });
    } else {
      this.equipa = this.equipaService.getEquipa();
      console.log('GestaoEquipaComponent | Equipa (ID <= 0):', this.equipa);
       this.loading = false;
    }
    console.log('GestaoEquipaComponent | Equipa:', this.equipa);
  }

  // Método para recarregar a equipa após mudanças
  recarregarEquipa() {
    if (this.idEquipa > 0) {
      this.equipaService.getEquipabyIDLight(this.idEquipa.toString()).subscribe((data: EquipaData) => {
        this.equipa = data;
        console.log('GestaoEquipaComponent | Equipa recarregada:', this.equipa);
      });
    }
  }

  abrirModalJogadores() {
    console.log('GestaoEquipaComponent | Abrindo modal jogadores');
    const modalRef = this.modalService.open(JogadorSeleccaoComponent, { size: 'lg' });
    modalRef.componentInstance.idEscalao = this.idEquipa * -1;
    modalRef.componentInstance.origem_gestao_equipa = true;
    console.log('GestaoEquipaComponent | Definindo origem_gestao_equipa = true no modal');

    modalRef.result.then(
      (result) => {
        console.log('GestaoEquipaComponent | Modal fechado com resultado:', result);
        if (result && result.action === 'add_multiple' && result.data) {
          console.log('GestaoEquipaComponent | Recebido add_multiple com dados:', result.data);
          // Adicionar múltiplos jogadores à equipa no backend
          let adicionados = 0;
          const total = result.data.length;
          console.log('GestaoEquipaComponent | Total de jogadores a adicionar:', total);

          for (const jogador of result.data) {
            console.log('GestaoEquipaComponent | Processando jogador:', jogador);
            // Verificar se o jogador já não está na equipa
            const jaExiste = this.equipa && this.equipa.jogadores ? this.equipa.jogadores.some(j => j.id === jogador.id) : false;
            console.log('GestaoEquipaComponent | Jogador já existe na equipa?', jaExiste);

            if (!jaExiste) {
              // Adicionar ao backend
              console.log('GestaoEquipaComponent | Chamando addJogadorEquipa para jogador:', jogador.id, jogador.nome);
              this.equipaService.addJogadorEquipa(jogador, this.idEquipa).subscribe({
                next: (response) => {
                  console.log('GestaoEquipaComponent | Resposta do backend para adicionar jogador:', response);
                  // Adicionar à lista local após sucesso no backend
                  if (this.equipa && this.equipa.jogadores) {
                    this.equipa.jogadores.push(jogador);
                  }
                  adicionados++;
                  console.log('GestaoEquipaComponent | Jogador adicionado com sucesso:', jogador.nome, 'Total adicionados:', adicionados);

                  // Quando todos os jogadores forem adicionados, recarregar a equipa
                  if (adicionados === total) {
                    console.log('GestaoEquipaComponent | Todos os jogadores processados, recarregando equipa');
                    this.recarregarEquipa();
                  }
                },
                error: (error) => {
                  console.error('GestaoEquipaComponent | Erro ao adicionar jogador:', error);
                  alert('Erro ao adicionar jogador: ' + jogador.nome);
                }
              });
            } else {
              adicionados++;
              console.log('GestaoEquipaComponent | Jogador já existe, pulando. Total processados:', adicionados);
              if (adicionados === total) {
                console.log('GestaoEquipaComponent | Todos os jogadores processados (alguns já existiam), recarregando equipa');
                this.recarregarEquipa();
              }
            }
          }
        } else if (result && result.action === 'novo') {
          // Lidar com novo jogador - pode navegar para a página de criação
          this.router.navigate(['/novo-jogador/jogadorSeleccao/-' + this.idEquipa]);
        } else {
          console.log('GestaoEquipaComponent | Ação não reconhecida ou sem dados:', result);
        }
      },
      (reason) => {
        console.log('GestaoEquipaComponent | Modal dispensado com razão:', reason);
      }
    );
  }

  abrirModalStaff() {

    this.router.navigate(['/staffSeleccao/' + this.idEquipa * -1]);
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

  // Método mantido para compatibilidade, mas não usado com modal
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
      this.equipaService.removeJogadorEquipa(jogador, this.idEquipa).subscribe({
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
      this.equipaService.removeStaffEquipa(staff, this.idEquipa).subscribe({
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
