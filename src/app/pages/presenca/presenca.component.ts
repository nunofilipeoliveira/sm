
import { Component, OnInit } from '@angular/core';
import { PresencaService } from '../../services/presenca.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataPipe } from '../fichaJogador/DataPipe';
import { Marcar_presencaComponent } from '../marcar_presenca/marcar_presenca.component';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PoppupMotivoComponent } from '../poppup-motivo/poppup-motivo.component';
import { JogadorSeleccaoComponent } from '../jogador-seleccao/jogador-seleccao.component';
import { EquipaService } from '../../services/equipa.service';
import { LoginServiceService } from '../../services/login-service.service';

@Component({
  selector: 'presenca',
  standalone: true,
  imports: [CommonModule, DataPipe, NgbDropdownModule, JogadorSeleccaoComponent],
  templateUrl: './presenca.component.html',
  styleUrl: './presenca.component.css'
})
export class PresencaComponent implements OnInit {

  presencaData: PresencaData;
  public spinner: boolean = false;
  public historico: string[] = [];
  public editMode: boolean = false;
  public dataTreino: any;
  public time: any;

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

  constructor(private route: ActivatedRoute, private presencaService: PresencaService, private router: Router, private modalService: NgbModal, private equipaService: EquipaService, private loginws: LoginServiceService) {

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

    // Ensure equipa is loaded
    this.equipaService.ensureEquipaLoaded().subscribe({
      next: (equipaData) => {
        if (equipaData) {
          console.log("PresencaComponent | equipa loaded", equipaData);
        } else {
          console.error("PresencaComponent | No equipa data available");
        }
      },
      error: (error) => {
        console.error("PresencaComponent | Error loading equipa", error);
      }
    });

    this.spinner = true;
    this.presencaService.getPresencasByid(idFichaPresenca).subscribe(
      {
        next: data => {
           this.presencaData = data;
           console.log("PresencaComponent | carregou Presenca", this.presencaData);
           console.log("PresencaComponent | spinner", this.spinner);

           // Set dataTreino and time from presencaData
           let tmphora = this.presencaData.hora.split(':');
           this.time = { hour: Number(tmphora[0]), minute: Number(tmphora[1]) };
           this.dataTreino = {
             "year": Number(this.presencaData.data / 10000 | 0),
             "month": Number((((this.presencaData.data) - ((this.presencaData.data / 10000 | 0) * 10000)) / 100 | 0)),
             "day": Number(this.presencaData.data - ((this.presencaData.data / 10000 | 0) * 10000 + ((((this.presencaData.data) - ((this.presencaData.data / 10000 | 0) * 10000)) / 100 | 0)) * 100))
           };

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
    this.presencaService.updatePresenca(this.presencaData, this.loginws.getLoginData().id).subscribe({
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

  retirarJogador(posicao: number) {
    console.log("Retirar Jogador", posicao);
    this.presencaData.jogadoresPresenca.splice(posicao, 1);
  }

  retirarStaff(posicao: number) {
    console.log("Retirar Staff", posicao);
    this.presencaData.staffPresenca.splice(posicao, 1);
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
        if (result == '') {
          this.presencaData.jogadoresPresenca[posicao].estado = "";
        }
      },
      (reason) => {
        // dismissed - reset state to unfilled
        this.presencaData.jogadoresPresenca[posicao].estado = "";
        this.presencaData.jogadoresPresenca[posicao].motivo = "";
      }
    );
  }

  openDialog_staff(posicao: any): void {
    const modalRef = this.modalService.open(PoppupMotivoComponent);
    modalRef.result.then(
      (result) => {
        console.log(result);
        this.presencaData.staffPresenca[posicao].motivo = result;
        if (result == '') {
          this.presencaData.staffPresenca[posicao].estado = "";
        }
      },
      (reason) => {
        // dismissed - reset state to unfilled
        this.presencaData.staffPresenca[posicao].estado = "";
        this.presencaData.staffPresenca[posicao].motivo = "";
      }
    );
  }

    seleccionarJogador() {
      console.log("SelecionarJogador", this.presencaData);
      this.presencaService.setPresenca(this.presencaData.jogadoresPresenca);
      this.presencaService.setData_Presenca(this.dataTreino.year, this.dataTreino.month, this.dataTreino.day);
      this.presencaService.setHora(this.time.hour, this.time.minute);
      this.presencaService.setStaffPresenca(this.presencaData.staffPresenca);
      this.presencaService.setPresencaTmp(this.presencaData);
      const modalRef = this.modalService.open(JogadorSeleccaoComponent, { size: 'lg' });
      modalRef.componentInstance.idEscalao = this.presencaData.id_escalao;
      modalRef.componentInstance.origem_gestao_equipa = false;
      modalRef.result.then(
        (result) => {
          console.log('Modal closed with result:', result);
          if (result.action === 'presenca_multiple' && result.data) {
            for (const jogador of result.data) {
              const jaExiste = this.presencaData.jogadoresPresenca.some((j: any) => j.id_jogador === jogador.id_jogador);
              if (!jaExiste) {
                this.presencaData.jogadoresPresenca.push(jogador);
              }
            }
          }
        },
        (reason) => {
          console.log('Modal dismissed with reason:', reason);
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
