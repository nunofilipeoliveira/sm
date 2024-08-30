import { PresencaService } from './../../services/presenca.service';
import { CommonModule } from '@angular/common';
import { NgbCalendar, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, NgbAccordionModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

import {
  MatDialog,
} from '@angular/material/dialog';
import { PoppupMotivoComponent } from '../poppup-motivo/poppup-motivo.component';
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


  public dataTreino={
    "year": 0,
    "month": 0,
    "day": 0
  }
  public selecionouData: boolean = false;
  public time = { hour: 0, minute: 0 };
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
  public sbmErroDia=false;

  constructor(private router: Router, private dialog: MatDialog, private equipaService: EquipaService, private presencaService: PresencaService, private loginws: LoginServiceService, private route: ActivatedRoute) {

    this.equipaData = {
      id: 0,
      epoca: "",
      escalao: "",
      password: "",
      jogadores: [],
      staff:[]
    }
  }

  ngOnInit() {

    this.sbmSuccess = false;
    this.sbmError = false;
    this.sbmvalidacao = false;
    this.abrirMarcacao = true;
    this.equipaData = this.equipaService.getEquipa();
    const routeParams = this.route.snapshot.paramMap;
    this.idFicha = Number(routeParams.get('id'));

    console.log("Marcar_presencaComponent | idFicha", this.idFicha);

    if (this.idFicha == 0) {

      //verifica se estamos a meio de preencher:
      let tmpPresencas2: jogadorPresencaData[] = this.presencaService.getPresenca()

      console.log("Marcar_presencaComponent | jogadorPresencaData", tmpPresencas2);

      if (tmpPresencas2.length > 0) {
        var today = new Date();
        console.log("Marcar_presencaComponent | data", this.presencaService.getData_Presenta());
        console.log("Marcar_presencaComponent | hora", this.presencaService.gethora());
        this.dataTreino = this.presencaService.getData_Presenta();
        this.time = this.presencaService.gethora();
        this.collapse_first = true;
        this.collapse_second = false;
        this.presencaJogadores = tmpPresencas2;
      }
      else {


        //SE id=0, vai carregar a equipa
        console.log("Marcar_presencaComponent | equipadata.id", this.equipaData)
        if (this.equipaData == undefined ||this.equipaData.jogadores.length==0) {
          console.log("Marcar_presencaComponent | equipa3", this.equipaData);

          this.equipaService.getEquipabyID(localStorage.getItem("idequipa_escalao")).subscribe(
            {
              next: data => {
                this.equipaData = data;
                this.equipaData.jogadores.sort((a, b) => (a.data_nascimento - b.data_nascimento));
                console.log("Marcar_presencaComponent | carregou equipa", this.equipaData);
                this.equipaService.setEquipa(this.equipaData);
                if (data != null) {

                } else {

                }
              },
              error: error => {
                console.log("Marcar_presencaComponent | Serviço equipa Erro!!");

              }
            });
        }



        console.log("Marcar_presencaComponent | oninit | presencaJogadorData", this.presencaJogadores);
        console.log("Marcar_presencaComponent | oninit | equipaData", this.equipaData);

        for (let i = 0; i < this.equipaData!.jogadores.length; i++) {

          const tmpPresencaJogador = {} as jogadorPresencaData;
          tmpPresencaJogador.id_jogador = this.equipaData!.jogadores[i].id;
          tmpPresencaJogador.nome_jogador = this.equipaData!.jogadores[i].nome;
          tmpPresencaJogador.motivo = "";

          this.presencaJogadores.push(tmpPresencaJogador);

        }

        for (let i = 0; i < this.equipaData!.staff.length; i++) {

          const tmpPresencaStaff = {} as staffPresencaData;
          tmpPresencaStaff.id_staff = this.equipaData!.staff[i].id;
          tmpPresencaStaff.nome_staff = this.equipaData!.staff[i].nome;
          tmpPresencaStaff.motivo = "";

          this.presencaStaff.push(tmpPresencaStaff);

        }

        console.log("Marcar_presencaComponent | oninit | presencaJogadorData", this.presencaJogadores);

        this.collapse_first = false;
        this.collapse_second = true;
        var today = new Date();
        this.dataTreino = {
          "year": Number(today.getFullYear()),
          "month": Number(String(today.getMonth() + 1).padStart(2, '0')),
          "day": Number(String(today.getDate()).padStart(2, '0'))
        }
        console.log('DataTreino', this.dataTreino);
        this.time = { hour: today.getHours(), minute: 0 };

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


  openDialog(posicao: any): void {

    //   this.dialog.open(PoppupMotivoComponent,{
    //      width:'400px',
    //      height:'220px'
    //   })

    let dialogRef = this.dialog.open(PoppupMotivoComponent, { width: '400px', height: '220px' }).afterClosed()
      .subscribe(response => {
        console.log(response);
        this.presencaJogadores[posicao]["motivo"] = response;

        if (response == '') {
          this.presencaJogadores[posicao]["estado"] = "";
          this.presencaJogadores[posicao]["estilo_estado"] = "";
        }

      });

  }

  openDialog_staff(posicao: any): void {

    //   this.dialog.open(PoppupMotivoComponent,{
    //      width:'400px',
    //      height:'220px'
    //   })

    let dialogRef = this.dialog.open(PoppupMotivoComponent, { width: '400px', height: '220px' }).afterClosed()
      .subscribe(response => {
        console.log(response);
        this.presencaStaff[posicao]["motivo"] = response;

        if (response == '') {
          this.presencaStaff[posicao]["estado"] = "";
          this.presencaStaff[posicao]["estilo_estado"] = "";
        }

      });

  }


  seleccionarJogador() {
    console.log("SelecionarJogador", this.presenca);
    this.presencaService.setPresenca(this.presencaJogadores);
    this.presencaService.setData_Presenca(this.dataTreino.year, this.dataTreino.month, this.dataTreino.day);
    this.presencaService.setHora(this.time.hour, this.time.minute);
    this.router.navigate(['/jogadorSeleccao/' + this.equipaService.getEquipa().id])
  }



  ngDropDwonClick(posicao: any, value: any) {
    this.presencaJogadores[posicao]["estado"] = value;
    if (value == 'Ausente (Avisou)') {
      this.openDialog(posicao);
      this.presencaJogadores[posicao]["estilo_estado"] = "background-color: palegoldenrod";
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

    if (value == '') {
      this.presencaJogadores[posicao]["estilo_estado"] = "";
      this.presencaJogadores[posicao]["motivo"] = "";
    }

  }




  ngDropDwonClick_staff(posicao: any, value: any) {
    this.presencaStaff[posicao]["estado"] = value;
    if (value == 'Ausente (Avisou)') {
      this.openDialog_staff(posicao);
      this.presencaStaff[posicao]["estilo_estado"] = "background-color: palegoldenrod";
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

    let tmpData:number = (this.dataTreino["year"] * 10000 + this.dataTreino["month"] * 100 + this.dataTreino["day"])
    let tmpHora:string = this.leftPad(this.time.hour.toString(), 2) + ':' + this.leftPad(this.time.minute.toString(), 2);

    this.presencaService.isPresencaByEquipaDataHora(this.equipaService.getEquipa().id, tmpData,tmpHora).subscribe(
      {
        next: data => {
          if (data == true) {
            console.log("Existe um treino na mesma data");
            this.collapse_first = false;
            this.collapse_second = true;
            this.sbmErroDia=true;
            document.location.href = '#top';

          }else{
            this.sbmErroDia=false;
          }

           if (data != null) {

          } else {

          }
        },
        error: error => {
          console.log("isPresencaByEquipaDataHora!!");

        }
      });


    this.collapse_first = true;
    this.collapse_second = false;

  }

  doSelecionaPresenca(posicao: any) {

    this.selecionouPresenca = true;
    console.log('Selecionado', posicao);
    this.altetas[posicao]["estiloBotaoPresenca"] = "background-color: rgb(132, 216, 142);"
    this.altetas[posicao]["estilo_estado"] = "background-color: rgb(132, 216, 142);"
  }



  doGravar() {


    this.spinner=true;
    console.log("Gravar e validar", this.presencaJogadores);
    let flagAtletaSemMarcacao = false;
    let count_marcacoes = 0;
    for (let i = 0; i < this.presencaJogadores.length; i++) {
      if (this.presencaJogadores[i].estado == undefined || this.presencaJogadores[i].estado == "") {
        flagAtletaSemMarcacao = true;
        this.sbmvalidacao = true
        this.collapse_first = true;
        this.collapse_second = false;
        this.spinner=false;
        document.location.href = '#top';
      }
    }

    for (let i = 0; i < this.presencaStaff.length; i++) {
      if (this.presencaStaff[i].estado == undefined || this.presencaStaff[i].estado == "") {
        flagAtletaSemMarcacao = true;
        this.sbmvalidacao = true
        this.collapse_first = true;
        this.collapse_second = false;
        this.spinner=false;
        document.location.href = '#top';
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
      presenca.jogadoresPresenca = this.presencaJogadores;
      console.log("gravar | equipaData - staff", this.presencaStaff);
      presenca.staffPresenca = this.presencaStaff;
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
                this.spinner=false;
                if (data == false) {
                  this.sbmError = true;
                }
                if (data == true) {
                  this.sbmSuccess = true;
                }
              } else {
              }
            },
            error: error => {
              console.log("Marcar_presencaComponent | Serviço gravarFichaJogador Erro!!");
              this.sbmError = true;
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
                this.spinner=false;
                if (data == false) {
                  this.sbmError = true;
                }
                if (data == true) {
                  this.sbmSuccess = true;
                }
              } else {
              }
            },
            error: error => {
              console.log("Marcar_presencaComponent | Serviço updatePresenca Erro!!");
              this.sbmError = true;
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

  sair() {
    this.router.navigate(['equipa']);
  }

  desligarWarn() {
    this.sbmvalidacao = false;
  }


}
