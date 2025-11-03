import { PresencaService } from './../../services/presenca.service';
import { CommonModule } from '@angular/common';
import { NgbCalendar, NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, NgbAccordionModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

import {
  MatDialog,
} from '@angular/material/dialog';
import { PoppupMotivoComponent } from '../poppup-motivo/poppup-motivo.component';
import { JogadorSeleccaoComponent } from '../jogador-seleccao/jogador-seleccao.component';
import { EquipaService } from '../../services/equipa.service';
import { LoginServiceService } from '../../services/login-service.service';
import { ActivatedRoute, Router } from '@angular/router';




export class NgbdDropdownBasic { }

@Component({
  selector: 'icons-cmp',
  standalone: true,
  imports: [NgbDatepickerModule, NgbAlertModule, FormsModule, CommonModule, NgbDropdownModule, NgbAccordionModule, NgbTimepickerModule],
  templateUrl: 'marcar_presenca.component.html',
  styleUrl: './marcar_presenca.component.css'
})


export class Marcar_presencaComponent implements OnInit {

  @ViewChild('alertsSection') alertsSection!: ElementRef;

  private scrollToAlerts() {
    if (this.alertsSection) {
      this.alertsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  trackByFn(index: number, item: any): any {
    return item.id_staff || index;
  }


  public dataTreino = {
    "year": new Date().getFullYear(),
    "month": new Date().getMonth() + 1,
    "day": new Date().getDate()
  }
  public selecionouData: boolean = false;
  public time = { hour: new Date().getHours(), minute: 0 };
  public selecionouPresenca: boolean = false;
  public selecionouOutro: boolean = false;
  public altetas: any[] = [];
  public collapse_first: boolean = false;
  public collapse_second: boolean = false;
  public presencaJogadores: jogadorPresencaData[] = [];
  public presencaStaff: staffPresencaData[] = [];
  public equipaData: EquipaData;
  public presenca = {} as PresencaData;
  public spinner: boolean = false;
  public idFicha: number = 0;




  public sbmSuccess: boolean = false;
  public sbmError: boolean = false;
  public abrirMarcacao = true;
  public sbmvalidacao = false;
  public sbmErroDia = false;

  constructor(private router: Router, private modalService: NgbModal, private equipaService: EquipaService, private presencaService: PresencaService, private loginws: LoginServiceService, private route: ActivatedRoute) {

    this.equipaData = {
      id: 0,
      epoca: "",
      escalao: "",
      password: "",
      jogadores: [],
      staff: []
    }
  }

  ngOnInit() {

    this.sbmSuccess = false;
    this.sbmError = false;
    this.sbmvalidacao = false;
    this.abrirMarcacao = true;

    const routeParams = this.route.snapshot.paramMap;
    this.idFicha = Number(routeParams.get('id'));

    console.log("Marcar_presencaComponent | idFicha", this.idFicha);

    // Always start with date/time selection
    this.collapse_first = false;
    this.collapse_second = true;

    // If editing existing attendance, load team data and show the form
    if (this.idFicha > 0) {
      this.loadTeamDataAndInitialize();
    }
  }

  private loadTeamDataAndInitialize() {
    this.equipaService.ensureEquipaLoaded().subscribe({
      next: (equipaData) => {
        if (equipaData) {
          this.equipaData = equipaData;
          this.equipaData.jogadores.sort((a, b) => (a.data_nascimento - b.data_nascimento));
          this.equipaService.setEquipa(this.equipaData);
          console.log("Marcar_presencaComponent | equipa loaded", this.equipaData);
          console.log("Marcar_presencaComponent | equipa staff", this.equipaData.staff);
          console.log("Marcar_presencaComponent | staff length", this.equipaData.staff?.length || 0);

          // After loading team data, validate date and show team members
          this.validateDateAndShowTeam();
        } else {
          console.error("Marcar_presencaComponent | No equipa data available");
          this.abrirMarcacao = false;
        }
      },
      error: (error) => {
        console.error("Marcar_presencaComponent | Error loading equipa", error);
        this.abrirMarcacao = false;
      }
    });
  }

  private validateDateAndShowTeam() {
    let tmpData: number = (this.dataTreino["year"] * 10000 + this.dataTreino["month"] * 100 + this.dataTreino["day"])
    let tmpHora: string = this.leftPad(this.time.hour.toString(), 2) + ':' + this.leftPad(this.time.minute.toString(), 2);

    console.log("Marcar_presencaComponent | validating date:", tmpData, tmpHora);

    this.presencaService.isPresencaByEquipaDataHora(this.equipaData.id, tmpData, tmpHora).subscribe(
      {
        next: data => {
          console.log("Marcar_presencaComponent | date validation result:", data);
          if (data == true) {
            console.log("Existe um treino na mesma data");
            this.collapse_first = false;
            this.collapse_second = true;
            this.sbmErroDia = true;
            this.scrollToAlerts();
          } else {
            this.sbmErroDia = false;
            console.log("Marcar_presencaComponent | date is valid, initializing team data");
            this.initializePresencaData();
            console.log("Marcar_presencaComponent | showing team members interface");
            this.collapse_first = true;
            this.collapse_second = false;
          }
        },
        error: error => {
          console.log("isPresencaByEquipaDataHora error:", error);
        }
      });
  }

  private initializePresencaData() {
    // Initialize jogadores
    if (this.equipaData && this.equipaData.jogadores && Array.isArray(this.equipaData.jogadores)) {
      for (let i = 0; i < this.equipaData.jogadores.length; i++) {
        const tmpPresencaJogador = {} as jogadorPresencaData;
        tmpPresencaJogador.id_jogador = this.equipaData.jogadores[i].id;
        tmpPresencaJogador.nome_jogador = this.equipaData.jogadores[i].nome;
        tmpPresencaJogador.motivo = "";
        tmpPresencaJogador.estado = "";
        tmpPresencaJogador.estilo_estado = "";
        tmpPresencaJogador.apagar = false;
        this.presencaJogadores.push(tmpPresencaJogador);
      }
    }

    // Initialize staff
    console.log("Marcar_presencaComponent | initializing staff, equipaData.staff:", this.equipaData?.staff);
    if (this.equipaData && this.equipaData.staff && Array.isArray(this.equipaData.staff)) {
      for (let i = 0; i < this.equipaData.staff.length; i++) {
        const tmpPresencaStaff = {} as staffPresencaData;
        tmpPresencaStaff.id_staff = this.equipaData.staff[i].id;
        tmpPresencaStaff.nome_staff = this.equipaData.staff[i].nome;
        tmpPresencaStaff.motivo = "";
        tmpPresencaStaff.estado = "";
        tmpPresencaStaff.estilo_estado = "";
        this.presencaStaff.push(tmpPresencaStaff);
        console.log("Marcar_presencaComponent | added staff member:", tmpPresencaStaff);
      }
    }

    console.log("Marcar_presencaComponent | initialized presenca data", this.presencaJogadores);
    console.log("Marcar_presencaComponent | initialized staff data", this.presencaStaff);
    console.log("Marcar_presencaComponent | presencaStaff length:", this.presencaStaff.length);
    console.log("Marcar_presencaComponent | presencaStaff content:", this.presencaStaff);

    this.collapse_first = false;
    this.collapse_second = true;
    // Date and time are already initialized in the class properties
    console.log('DataTreino initialized:', this.dataTreino);
    console.log('Time initialized:', this.time);
  }

  private initializeComponent() {
    if (this.idFicha == 0) {

      //verifica se estamos a meio de preencher:
      let tmpPresencas2: jogadorPresencaData[] = this.presencaService.getPresenca()
      this.idFicha = this.presencaService.getPresencaTmp().id;
      this.presenca = this.presencaService.getPresencaTmp();

      console.log("Marcar_presencaComponent | jogadorPresencaData", tmpPresencas2);

      if (tmpPresencas2.length > 0) {
        // Load team data first when returning from player selection
        this.equipaService.ensureEquipaLoaded().subscribe({
          next: (equipaData) => {
            if (equipaData) {
              this.equipaData = equipaData;
              this.equipaData.jogadores.sort((a, b) => (a.data_nascimento - b.data_nascimento));
              this.equipaService.setEquipa(this.equipaData);
              console.log("Marcar_presencaComponent | equipa loaded on return", this.equipaData);

              var today = new Date();
              console.log("Marcar_presencaComponent | data", this.presencaService.getData_Presenta());
              console.log("Marcar_presencaComponent | hora", this.presencaService.gethora());
              this.dataTreino = this.presencaService.getData_Presenta();
              this.time = this.presencaService.gethora();
              this.collapse_first = true;
              this.collapse_second = false;
              this.presencaJogadores = tmpPresencas2;
              this.presencaStaff = this.presencaService.getStaffPresenca();
              console.log("Marcar_presencaComponent | loaded existing staff data", this.presencaStaff);
            } else {
              console.error("Marcar_presencaComponent | No equipa data available on return");
              this.abrirMarcacao = false;
            }
          },
          error: (error) => {
            console.error("Marcar_presencaComponent | Error loading equipa on return", error);
            this.abrirMarcacao = false;
          }
        });
      }
      else {



        console.log("Marcar_presencaComponent | oninit | presencaJogadorData", this.presencaJogadores);
        console.log("Marcar_presencaComponent | oninit | equipaData", this.equipaData);
        console.log("Marcar_presencaComponent | oninit | staff data", this.presencaService.getStaffPresenca());

        this.initializePresencaData();

      }
    }
    else {
      console.log("Vai carregar ficha");
      this.collapse_first = true;
      this.collapse_second = false;
      this.spinner = true;
      this.abrirMarcacao = false;


      this.presencaService.getPresencasByid(this.idFicha).subscribe(
        {
          next: data => {
            this.presenca = data;
            let tmphora = this.presenca.hora.split(':')
            this.time = { hour: Number(tmphora[0]), minute: Number(tmphora[1]) };

            console.log("dia:", this.presenca.data - ((this.presenca.data / 10000 | 0) * 10000 + ((((this.presenca.data) - ((this.presenca.data / 10000 | 0) * 10000)) / 100 | 0)) * 100));


            this.dataTreino = {
              "year": Number(this.presenca.data / 10000 | 0),
              "month": Number((((this.presenca.data) - ((this.presenca.data / 10000 | 0) * 10000)) / 100 | 0)),
              "day": Number(this.presenca.data - ((this.presenca.data / 10000 | 0) * 10000 + ((((this.presenca.data) - ((this.presenca.data / 10000 | 0) * 10000)) / 100 | 0)) * 100))
            }

            if (data != null) {

              for (let i = 0; i < this.presenca.jogadoresPresenca.length; i++) {

                const tmpPresencaJogador = {} as jogadorPresencaData;
                tmpPresencaJogador.id_jogador = this.presenca.jogadoresPresenca[i].id_jogador;
                tmpPresencaJogador.nome_jogador = this.presenca.jogadoresPresenca[i].nome_jogador;
                tmpPresencaJogador.motivo = this.presenca.jogadoresPresenca[i].motivo;
                tmpPresencaJogador.estado = this.presenca.jogadoresPresenca[i].estado;
                tmpPresencaJogador.estilo_estado = this.presenca.jogadoresPresenca[i].estilo_estado;

                if (tmpPresencaJogador.estado == 'Ausente (Avisou)') {
                  tmpPresencaJogador.estilo_estado = "background-color: palegoldenrod";
                }
                if (tmpPresencaJogador.estado == 'Presente') {
                  tmpPresencaJogador.estilo_estado = "background-color: lightgreen;";
                }
                if (tmpPresencaJogador.estado == 'Não convocado') {
                  tmpPresencaJogador.estilo_estado = "background-color:lightgray";
                }
                if (tmpPresencaJogador.estado == 'Ausente (Não Avisou)') {
                  tmpPresencaJogador.estilo_estado = "background-color: gold;";
                }
                if (tmpPresencaJogador.estado == 'Lesão') {
                  tmpPresencaJogador.estilo_estado = "background-color: BlueViolet;";
                }
                if (tmpPresencaJogador.estado == '') {
                  tmpPresencaJogador.estilo_estado = "";
                }

                this.presencaJogadores.push(tmpPresencaJogador);

              }

              for (let i = 0; i < this.presenca.staffPresenca.length; i++) {

                const tmpStaffJogador = {} as staffPresencaData;
                tmpStaffJogador.id_staff = this.presenca.staffPresenca[i].id_staff;
                tmpStaffJogador.nome_staff = this.presenca.staffPresenca[i].nome_staff;
                tmpStaffJogador.motivo = this.presenca.staffPresenca[i].motivo;
                tmpStaffJogador.estado = this.presenca.staffPresenca[i].estado;
                tmpStaffJogador.estilo_estado = this.presenca.staffPresenca[i].estilo_estado;

                if (tmpStaffJogador.estado == 'Ausente (Avisou)') {
                  tmpStaffJogador.estilo_estado = "background-color: palegoldenrod";
                }
                if (tmpStaffJogador.estado == 'Presente') {
                  tmpStaffJogador.estilo_estado = "background-color: lightgreen;";
                }
                if (tmpStaffJogador.estado == 'Não convocado') {
                  tmpStaffJogador.estilo_estado = "background-color:lightgray";
                }
                if (tmpStaffJogador.estado == 'Ausente (Não Avisou)') {
                  tmpStaffJogador.estilo_estado = "background-color: gold;";
                }
                if (tmpStaffJogador.estado == 'Lesão') {
                  tmpStaffJogador.estilo_estado = "background-color: BlueViolet;";
                }
                if (tmpStaffJogador.estado == '') {
                  tmpStaffJogador.estilo_estado = "";
                }

                this.presencaStaff.push(tmpStaffJogador);

              }



              this.spinner = false;
              this.abrirMarcacao = true;

            } else {

            }
          },
          error: error => {
            console.log("Marcar_presencaComponent | Serviço equipa Erro!!");

          }
        });




    }


  }

  allPresente() {
    for (let i = 0; i < this.presencaJogadores.length; i++) {
      this.presencaJogadores[i].estado = "Presente";
      this.presencaJogadores[i].motivo = "";
      this.presencaJogadores[i].estilo_estado = "background-color: lightgreen;";
    }

    for (let i = 0; i < this.presencaStaff.length; i++) {
      this.presencaStaff[i].estado = "Presente";
      this.presencaStaff[i].motivo = "";
      this.presencaStaff[i].estilo_estado = "background-color: lightgreen;";
    }
  }


  openDialog(posicao: any, estado: string): void {
    const modalRef = this.modalService.open(PoppupMotivoComponent);
    modalRef.componentInstance.motivoInicial = this.presencaJogadores[posicao]["motivo"];
    modalRef.result.then(
      (result: string) => {
        console.log(result);
        this.presencaJogadores[posicao]["motivo"] = result;

        if (result == '') {
          this.presencaJogadores[posicao]["estado"] = "";
          this.presencaJogadores[posicao]["estilo_estado"] = "";
        } else {
          this.presencaJogadores[posicao]["estado"] = estado;
          if (estado == 'Ausente (Avisou)') {
            this.presencaJogadores[posicao]["estilo_estado"] = "background-color: palegoldenrod";
          } else if (estado == 'Lesão') {
            this.presencaJogadores[posicao]["estilo_estado"] = "background-color: BlueViolet;";
          }
        }
      },
      (reason: any) => {
        // dismissed
      }
    );
  }

  openDialog_staff(posicao: any, estado: string): void {
    const modalRef = this.modalService.open(PoppupMotivoComponent);
    modalRef.componentInstance.motivoInicial = this.presencaStaff[posicao]["motivo"];
    modalRef.result.then(
      (result: string) => {
        console.log(result);
        this.presencaStaff[posicao]["motivo"] = result;

        if (result == '') {
          this.presencaStaff[posicao]["estado"] = "";
          this.presencaStaff[posicao]["estilo_estado"] = "";
        } else {
          this.presencaStaff[posicao]["estado"] = estado;
          if (estado == 'Ausente (Avisou)') {
            this.presencaStaff[posicao]["estilo_estado"] = "background-color: palegoldenrod";
          }
        }
      },
      (reason: any) => {
        // dismissed
      }
    );
  }


  seleccionarJogador() {
    console.log("SelecionarJogador", this.presenca);
    this.presencaService.setPresenca(this.presencaJogadores);
    this.presencaService.setData_Presenca(this.dataTreino.year, this.dataTreino.month, this.dataTreino.day);
    this.presencaService.setHora(this.time.hour, this.time.minute);
    this.presencaService.setStaffPresenca(this.presencaStaff);
    this.presencaService.setPresencaTmp(this.presenca);
    const modalRef = this.modalService.open(JogadorSeleccaoComponent, { size: 'lg' });
    modalRef.componentInstance.idEscalao = this.equipaService.getEquipa().id;
    modalRef.componentInstance.origem_gestao_equipa = false;
    modalRef.result.then(
      (result) => {
        console.log('Modal closed with result:', result);
        if (result.action === 'presenca_multiple' && result.data) {
          for (const jogador of result.data) {
            const jaExiste = this.presencaJogadores.some(j => j.id_jogador === jogador.id_jogador);
            if (!jaExiste) {
              this.presencaJogadores.push(jogador);
            }
          }
        }
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }



  ngDropDwonClick(posicao: any, value: any) {
    this.presencaJogadores[posicao]["estado"] = value;
    if (value == 'Ausente (Avisou)') {
      this.openDialog(posicao, value);
    }
    if (value == 'Presente') {
      this.presencaJogadores[posicao]["estilo_estado"] = "background-color: lightgreen;";
      this.presencaJogadores[posicao]["motivo"] = "";
    }
    if (value == 'Não convocado') {
      this.presencaJogadores[posicao]["estilo_estado"] = "background-color:lightgray";
      this.presencaJogadores[posicao]["motivo"] = "";
    }
    if (value == 'Ausente (Não Avisou)') {
      this.presencaJogadores[posicao]["estilo_estado"] = "background-color: gold;";
      this.presencaJogadores[posicao]["motivo"] = "";
    }
    if (value == 'Lesão') {
      this.openDialog(posicao, value);
    }

    if (value == '') {
      this.presencaJogadores[posicao]["estilo_estado"] = "";
      this.presencaJogadores[posicao]["motivo"] = "";
    }

  }

  retirarJogador(indice_jogador: number, posicao: any) {
    console.log("Retirar Jogador", indice_jogador);
    this.presencaJogadores.splice(posicao, 1);

  }

  ngDropDwonClick_staff(posicao: any, value: any) {
    this.presencaStaff[posicao]["estado"] = value;
    if (value == 'Ausente (Avisou)') {
      this.openDialog_staff(posicao, value);
    }
    if (value == 'Presente') {
      this.presencaStaff[posicao]["estilo_estado"] = "background-color: lightgreen;";
      this.presencaStaff[posicao]["motivo"] = "";
    }
    if (value == 'Não convocado') {
      this.presencaStaff[posicao]["estilo_estado"] = "background-color:lightgray";
      this.presencaStaff[posicao]["motivo"] = "";
    }
    if (value == 'Ausente (Não Avisou)') {
      this.presencaStaff[posicao]["estilo_estado"] = "background-color: gold;";
      this.presencaStaff[posicao]["motivo"] = "";
    }

    if (value == '') {
      this.presencaStaff[posicao]["estilo_estado"] = "";
      this.presencaStaff[posicao]["motivo"] = "";
    }

  }


  doSelecionaData() {
    console.log('Data Treino:', this.dataTreino);

    // Load team data first, then validate date
    this.equipaService.ensureEquipaLoaded().subscribe({
      next: (equipaData) => {
        if (equipaData) {
          this.equipaData = equipaData;
          this.equipaData.jogadores.sort((a, b) => (a.data_nascimento - b.data_nascimento));
          this.equipaService.setEquipa(this.equipaData);
          console.log("Marcar_presencaComponent | equipa loaded", this.equipaData);
          console.log("Marcar_presencaComponent | equipa staff", this.equipaData.staff);
          console.log("Marcar_presencaComponent | staff length", this.equipaData.staff?.length || 0);

          // After loading team data, validate date and show team members
          this.validateDateAndShowTeam();
        } else {
          console.error("Marcar_presencaComponent | No equipa data available");
          this.abrirMarcacao = false;
        }
      },
      error: (error) => {
        console.error("Marcar_presencaComponent | Error loading equipa", error);
        this.abrirMarcacao = false;
      }
    });
  }

  private validateDateAndProceed() {
    let tmpData: number = (this.dataTreino["year"] * 10000 + this.dataTreino["month"] * 100 + this.dataTreino["day"])
    let tmpHora: string = this.leftPad(this.time.hour.toString(), 2) + ':' + this.leftPad(this.time.minute.toString(), 2);

    this.presencaService.isPresencaByEquipaDataHora(this.equipaData.id, tmpData, tmpHora).subscribe(
      {
        next: data => {
          if (data == true) {
            console.log("Existe um treino na mesma data");
            this.collapse_first = false;
            this.collapse_second = true;
            this.sbmErroDia = true;
            this.scrollToAlerts();

          } else {
            this.sbmErroDia = false;
            // Initialize team data and show players/staff section
            console.log("Marcar_presencaComponent | initializing team data after date validation");
            this.initializePresencaData();
            console.log("Marcar_presencaComponent | showing players/staff section");
            this.collapse_first = true;
            this.collapse_second = false;
          }

          if (data != null) {

          } else {

          }
        },
        error: error => {
          console.log("isPresencaByEquipaDataHora!!");

        }
      });
  }

  voltarParaData() {
    this.collapse_first = false;
    this.collapse_second = true;
    this.sbmErroDia = false;
  }

  doSelecionaPresenca(posicao: any) {

    this.selecionouPresenca = true;
    console.log('Selecionado', posicao);
    this.altetas[posicao]["estiloBotaoPresenca"] = "background-color: rgb(132, 216, 142);"
    this.altetas[posicao]["estilo_estado"] = "background-color: rgb(132, 216, 142);"
  }



  doGravar() {

    console.log("gravar - presenças_staff", this.presencaStaff);


    this.spinner = true;
    console.log("Gravar e validar", this.presencaJogadores);
    let flagAtletaSemMarcacao = false;
    let count_marcacoes = 0;
    for (let i = 0; i < this.presencaJogadores.length; i++) {
      if (this.presencaJogadores[i].estado == undefined || this.presencaJogadores[i].estado == "") {
        flagAtletaSemMarcacao = true;
        this.sbmvalidacao = true
        this.collapse_first = true;
        this.collapse_second = false;
        this.spinner = false;
        this.scrollToAlerts();
      }
    }

    for (let i = 0; i < this.presencaStaff.length; i++) {
      if (this.presencaStaff[i].estado == undefined || this.presencaStaff[i].estado == "") {
        flagAtletaSemMarcacao = true;
        this.sbmvalidacao = true
        this.collapse_first = true;
        this.collapse_second = false;
        this.spinner = false;
        this.scrollToAlerts();
      }
    }


    console.log("Validação", flagAtletaSemMarcacao);




    if (flagAtletaSemMarcacao == false) {
      this.sbmvalidacao = false;
      console.log("gravar | equipaData", this.equipaData);
      this.collapse_first = true;
      this.collapse_second = true;
      this.abrirMarcacao = false;

      const presenca = {} as PresencaData;
      console.log("gravar | equipaData 1");

      // Use the original arrays directly - the service will handle JSON formatting
      presenca.jogadoresPresenca = this.presencaJogadores;
      presenca.staffPresenca = this.presencaStaff;

      console.log("gravar | jogadoresPresenca", presenca.jogadoresPresenca);
      console.log("gravar | staffPresenca", presenca.staffPresenca);

      console.log("gravar | equipaData 2");
      presenca.data = (this.dataTreino["year"] * 10000 + this.dataTreino["month"] * 100 + this.dataTreino["day"])
      console.log("gravar | equipaData 3");
      presenca.hora = this.leftPad(this.time.hour.toString(), 2) + ':' + this.leftPad(this.time.minute.toString(), 2);
      console.log("gravar | equipaData 4");
      presenca.escalao_descricao = this.equipaData.escalao;
      console.log("gravar | equipaData 5");
      console.log("gravar | ", presenca);
      presenca.id_escalao = this.equipaService.getEquipa().id;
      console.log("gravar | equipaData 6");
      presenca.id_utilizador_criacao = this.loginws.getLoginData().id;
      console.log("gravar | equipaData 7");
      var today = new Date();
      console.log("gravar | equipaData 8");
      presenca.data_criacao = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0')
      presenca.user_criacao = this.loginws.getLoginData().user;
      console.log("gravar | equipaData 9");


      if (this.idFicha == 0) {

        this.presencaService.createPresenca(presenca).subscribe(
          {
            next: data => {
              console.log("Marcar_presencaComponent | Pedido para criar Presenca", this.equipaData);
              if (data != null) {
                this.spinner = false;
                if (data == false) {
                  this.sbmError = true;
                }
                if (data == true) {
                  this.sbmSuccess = true;
                }
                // Scroll to alerts after a brief delay to ensure DOM is updated
                setTimeout(() => this.scrollToAlerts(), 100);
              } else {
              }
            },
            error: error => {
              console.log("Marcar_presencaComponent | Serviço gravarFichaJogador Erro!!");
              this.sbmError = true;
              this.scrollToAlerts();
            }
          });
      } else {
        this.presenca.id = this.idFicha;
        this.presenca.jogadoresPresenca = this.presencaJogadores;
        this.presenca.staffPresenca = this.presencaStaff;
        console.log("Marcar_presencaComponent | idPresenca", this.presenca.id);
        this.presencaService.updatePresenca(this.presenca, this.loginws.getLoginData().id).subscribe(
          {
            next: data => {
              console.log("Marcar_presencaComponent | Pedido para update Presenca", this.equipaData);
              if (data != null) {
                this.spinner = false;
                if (data == false) {
                  this.sbmError = true;
                }
                if (data == true) {
                  this.sbmSuccess = true;
                }
                // Scroll to alerts after a brief delay to ensure DOM is updated
                setTimeout(() => this.scrollToAlerts(), 100);
              } else {
              }
            },
            error: error => {
              console.log("Marcar_presencaComponent | Serviço updatePresenca Erro!!");
              this.sbmError = true;
              this.scrollToAlerts();
            }
          });
      }

    }

    this.presencaService.clear();
  }

  leftPad(parmnumber: string, targetLength: number) {
    var output = parmnumber + '';
    while (output.length < targetLength) {
      output = '0' + output;
    }
    return output;
  }

  cancelarMarcacao() {
    // Clear all manually added players and navigate back to /equipa
    this.presencaJogadores = this.presencaJogadores.filter(jogador => !jogador.apagar);
    this.router.navigate(['/equipa']);
  }

  sair() {
    // After saving, navigate back to the updated presenca view
    if (this.idFicha > 0) {
      this.router.navigate(['/presenca/' + this.idFicha]);
    } else {
      this.router.navigate(['equipa']);
    }
  }

  desligarWarn() {
    this.sbmvalidacao = false;
  }


}
