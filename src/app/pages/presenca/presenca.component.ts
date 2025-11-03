
import { Component, OnInit } from '@angular/core';
import { PresencaService } from '../../services/presenca.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataPipe } from '../fichaJogador/DataPipe';
import { Marcar_presencaComponent } from '../marcar_presenca/marcar_presenca.component';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PoppupMotivoComponent } from '../poppup-motivo/poppup-motivo.component';

@Component({
  selector: 'presenca',
  standalone: true,
  imports: [CommonModule, DataPipe, NgbDropdownModule],
  templateUrl: './presenca.component.html',
  styleUrl: './presenca.component.css'
})
export class PresencaComponent implements OnInit {

  presencaData: PresencaData;
  public spinner: boolean = false;
  public historico: string[] = [];
  public editMode: boolean = false;

  getRowStyle(estado: string): string {
    switch (estado) {
      case 'Presente':
        return 'background-color: rgba(25, 135, 84, 0.1);';
      case 'Ausente (Avisou)':
        return 'background-color: rgba(255, 193, 7, 0.1);';
      case 'Ausente (Não Avisou)':
        return 'background-color: rgba(220, 53, 69, 0.1);';
      case 'Não convocado':
        return 'background-color: rgba(108, 117, 125, 0.1);';
      case 'Lesão':
        return 'background-color: rgba(13, 202, 240, 0.1);';
      default:
        return '';
    }
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case 'Presente':
        return 'bg-success';
      case 'Ausente (Avisou)':
        return 'bg-warning text-dark';
      case 'Ausente (Não Avisou)':
        return 'bg-danger';
      case 'Não convocado':
        return 'bg-secondary';
      case 'Lesão':
        return 'bg-info';
      default:
        return 'bg-light text-dark';
    }
  }

  constructor(private route: ActivatedRoute, private presencaService: PresencaService, private router: Router, private modalService: NgbModal) {

    this.presencaData = {
      id: 0,
      data: 0,
      hora: "",
      id_escalao: 0,
      escalao_descricao: "",
      data_criacao: "",
      id_utilizador_criacao: 0,
      user_criacao: "",
      jogadoresPresenca: [],
      staffPresenca: []
    }
  }

  ngOnInit() {

    const routeParams = this.route.snapshot.paramMap;
    const idFichaPresenca = Number(routeParams.get('id'));
    console.log('PresencaComponent | idFichaPresenca:', idFichaPresenca);


    this.spinner = true;
    this.presencaService.getPresencasByid(idFichaPresenca).subscribe(
      {
        next: data => {
          this.presencaData = data;
          console.log("PresencaComponent | carregou Presenca", this.presencaData);
          console.log("PresencaComponent | spinner", this.spinner);

          this.presencaService.getHistoricoByid(idFichaPresenca).subscribe(
            {
              next: data => {
                this.historico = data;
                console.log("PresencaComponent | historico", this.historico);

                this.spinner = false;
                if (data != null) {

                } else {

                }
              },
              error: error => {
                console.log("PresencaComponent | Serviço Login Erro!!");

              }
            });

          if (data != null) {

          } else {

          }
        },
        error: error => {
          console.log("PresencaComponent | Serviço Login Erro!!");

        }
      });







    console.log('PresencaComponent | presencaData:', this.presencaData);

  }

  alterarFicha() {
    // Enable edit mode in the same page
    this.editMode = true;
  }

  voltarParaPresencas() {
    this.router.navigate(['/presencas'])
  }

  cancelEdit() {
    this.editMode = false;
  }

  allPresente() {
    // Mark all players as present
    this.presencaData.jogadoresPresenca.forEach(jogador => {
      jogador.estado = 'Presente';
      jogador.motivo = '';
    });

    // Mark all staff as present
    this.presencaData.staffPresenca.forEach(staff => {
      staff.estado = 'Presente';
      staff.motivo = '';
    });
  }

  saveEdit() {
    // Save the edited attendance data
    this.presencaService.updatePresenca(this.presencaData, this.presencaData.id_utilizador_criacao).subscribe({
      next: (result) => {
        if (result) {
          this.editMode = false;
          // Optionally reload the data or show success message
          this.ngOnInit(); // Reload the component data
        } else {
          // Handle error
          console.error('Error updating attendance');
        }
      },
      error: (error) => {
        console.error('Error updating attendance:', error);
      }
    });
  }

  // Methods for handling dropdown changes in edit mode
  ngDropDwonClick(posicao: any, value: any) {
    this.presencaData.jogadoresPresenca[posicao].estado = value;
    if (value == 'Ausente (Avisou)' || value == 'Lesão') {
      this.openDialog(posicao);
    } else {
      this.presencaData.jogadoresPresenca[posicao].motivo = "";
    }
  }

  ngDropDwonClick_staff(posicao: any, value: any) {
    this.presencaData.staffPresenca[posicao].estado = value;
    if (value == 'Ausente (Avisou)') {
      this.openDialog_staff(posicao);
    } else {
      this.presencaData.staffPresenca[posicao].motivo = "";
    }
  }

  openDialog(posicao: any): void {
    const modalRef = this.modalService.open(PoppupMotivoComponent);
    modalRef.result.then(
      (result) => {
        console.log(result);
        this.presencaData.jogadoresPresenca[posicao].motivo = result;
      },
      (reason) => {
        // dismissed
      }
    );
  }

  openDialog_staff(posicao: any): void {
    const modalRef = this.modalService.open(PoppupMotivoComponent);
    modalRef.result.then(
      (result) => {
        console.log(result);
        this.presencaData.staffPresenca[posicao].motivo = result;
      },
      (reason) => {
        // dismissed
      }
    );
  }

  getStatusBtnClass(estado: string): string {
    switch (estado) {
      case 'Presente':
        return 'btn-success';
      case 'Ausente (Avisou)':
        return 'btn-warning';
      case 'Ausente (Não Avisou)':
        return 'btn-danger';
      case 'Não convocado':
        return 'btn-secondary';
      case 'Lesão':
        return 'btn-info';
      default:
        return 'btn-outline-secondary';
    }
  }

}
