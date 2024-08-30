import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PresencaService } from '../../services/presenca.service';
import { NgbTooltipModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { EquipaService } from '../../services/equipa.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import moment, { Moment } from 'moment'


export interface AtletasDados {
  nome: string;
  presenca_treino: TreinosDados[];

}

export interface TreinosDados {
  dia: string;
  presenca: string;
  motivo: string
  estilo_presenca: string;
}




export interface LinhaQuadro {
  nomeJogador: string;
  idJogador: number;
  presenca_treino: TreinosDados[];
  count_treinos:number;
}

export interface TreinosDados {
  dia: string;
  presenca: string;
  presenca_1letra: string;
  motivo: string
  estilo_presenca: string;
}



@Component({
  selector: 'presencas',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbTooltipModule, MatButtonToggleModule, NgbDatepickerModule],
  templateUrl: './presencas.component.html',
  styleUrl: './presencas.component.css'
})
export class PresencasComponent implements OnInit {

  public altetas: AtletasDados[] = [];
  public treinos_selecionados: TreinosDados[] = [];
  public presencas: PresencaData[] = [];
  public linhasQuadro: LinhaQuadro[] = [];

  public linhasQuadroStaff: LinhaQuadro[] = [];

  spinner: boolean = false;
  public semRegistos: boolean = false;
  public filtro: string = "mes_atual";
  public filtro_datas: boolean = false;
  public filtro_dataInicio = {
    "year": 0,
    "month": 0,
    "day": 0
  }
  public filtro_dataFim = {
    "year": 0,
    "month": 0,
    "day": 0
  }




  constructor(private presencaService: PresencaService, private equipaService: EquipaService) { }

  loadQuadro() {

    for (let i = 0; i < this.presencas.length; i++) {
      console.log("Ciclo Ficha: ", this.presencas[i]);
      if (this.presencas[i].jogadoresPresenca != undefined) {
        for (let z = 0; z < this.presencas[i].jogadoresPresenca.length; z++) {

          const jogadortmp = this.linhasQuadro.filter(altetaQuadro => altetaQuadro.nomeJogador == this.presencas[i].jogadoresPresenca[z].nome_jogador);
          if (jogadortmp.length == 0) {
            const linhaAlteta: LinhaQuadro = { nomeJogador: this.presencas[i].jogadoresPresenca[z].nome_jogador, idJogador: this.presencas[i].jogadoresPresenca[z].id_jogador, presenca_treino: [], count_treinos:0 }
            this.linhasQuadro.push(linhaAlteta);
          }
        }
      }

      console.log("carregar Quadro:", i, this.presencas[i]);
      if (this.presencas[i].staffPresenca != undefined) {
        for (let z = 0; z < this.presencas[i].staffPresenca.length; z++) {

          const jogadortmp = this.linhasQuadroStaff.filter(staffQuadro => staffQuadro.nomeJogador == this.presencas[i].staffPresenca[z].nome_staff);
          if (jogadortmp.length == 0) {
            const linhaAlteta: LinhaQuadro = { nomeJogador: this.presencas[i].staffPresenca[z].nome_staff, idJogador: this.presencas[i].staffPresenca[z].id_staff, presenca_treino: [], count_treinos:0 }
            this.linhasQuadroStaff.push(linhaAlteta);
          }
        }
      }
    }


    //linhas quadro de jogador
    for (let i = 0; i < this.linhasQuadro.length; i++) {
      for (let z = 0; z < this.presencas.length; z++) {
        const tmpTreino: TreinosDados = { dia: "", presenca: "", motivo: "", estilo_presenca: "", presenca_1letra: "" };
        this.linhasQuadro[i].presenca_treino.push(tmpTreino);

        this.linhasQuadro[i].presenca_treino[z].dia = this.presencas[z].data.toString();

        const jogadortmp = this.presencas[z].jogadoresPresenca.filter(atletaTreino => atletaTreino.id_jogador == this.linhasQuadro[i].idJogador);
        if (jogadortmp.length == 0) {
          this.linhasQuadro[i].presenca_treino[z].motivo = ""
          this.linhasQuadro[i].presenca_treino[z].presenca = ""
        } else {

          if (jogadortmp[0].motivo != "") {
            this.linhasQuadro[i].presenca_treino[z].motivo = " | " + jogadortmp[0].motivo;
          }


          switch (jogadortmp[0].estado) {
            case "Presente":
              this.linhasQuadro[i].presenca_treino[z].presenca_1letra = "P"
              this.linhasQuadro[i].presenca_treino[z].estilo_presenca = "background-color: lightgreen;"
              break;
            case "Ausente (Avisou)":
              this.linhasQuadro[i].presenca_treino[z].presenca_1letra = "A"
              this.linhasQuadro[i].presenca_treino[z].estilo_presenca = "background-color: palegoldenrod"
              break;
            case "Não convocado":
              this.linhasQuadro[i].presenca_treino[z].presenca_1letra = "N"
              this.linhasQuadro[i].presenca_treino[z].estilo_presenca = "background-color:lightgray"
              break;
            case "Ausente (Não Avisou)":
              this.linhasQuadro[i].presenca_treino[z].presenca_1letra = "F"
              this.linhasQuadro[i].presenca_treino[z].estilo_presenca = "background-color: gold;"
              break;
          }
          this.linhasQuadro[i].presenca_treino[z].presenca = jogadortmp[0].estado;

        }

      }


    }

    console.log("LinhasQuadro: Final", this.linhasQuadro);

    console.log("Inicio Quadro Staff", this.linhasQuadroStaff);

    //linhas quadro Staf
    for (let i = 0; i < this.linhasQuadroStaff.length; i++) {
      for (let z = 0; z < this.presencas.length; z++) {
        const tmpTreino: TreinosDados = { dia: "", presenca: "", motivo: "", estilo_presenca: "", presenca_1letra: "" };
        this.linhasQuadroStaff[i].presenca_treino.push(tmpTreino);
        this.linhasQuadroStaff[i].presenca_treino[z].dia = this.presencas[z].data.toString();
        if (this.presencas[z].staffPresenca != undefined) {
          const jogadortmp = this.presencas[z].staffPresenca.filter(atletaTreino => atletaTreino.id_staff == this.linhasQuadroStaff[i].idJogador);
          console.log("Staff 2");
          if (jogadortmp.length == 0) {
            this.linhasQuadroStaff[i].presenca_treino[z].motivo = ""
            this.linhasQuadroStaff[i].presenca_treino[z].presenca = ""
          } else {

            if (jogadortmp[0].motivo != "") {
              this.linhasQuadroStaff[i].presenca_treino[z].motivo = " | " + jogadortmp[0].motivo;
            }

            switch (jogadortmp[0].estado) {
              case "Presente":
                this.linhasQuadroStaff[i].presenca_treino[z].presenca_1letra = "P"
                this.linhasQuadroStaff[i].presenca_treino[z].estilo_presenca = "background-color: lightgreen;"
                break;
              case "Ausente (Avisou)":
                this.linhasQuadroStaff[i].presenca_treino[z].presenca_1letra = "A"
                this.linhasQuadroStaff[i].presenca_treino[z].estilo_presenca = "background-color: palegoldenrod"
                break;
              case "Não convocado":
                this.linhasQuadroStaff[i].presenca_treino[z].presenca_1letra = "N"
                this.linhasQuadroStaff[i].presenca_treino[z].estilo_presenca = "background-color:lightgray"
                break;
              case "Ausente (Não Avisou)":
                this.linhasQuadroStaff[i].presenca_treino[z].presenca_1letra = "F"
                this.linhasQuadroStaff[i].presenca_treino[z].estilo_presenca = "background-color: gold;"
                break;
            }
            this.linhasQuadroStaff[i].presenca_treino[z].presenca = jogadortmp[0].estado;
          }
        }
      }
    }


          //carrega totalizadores
          for (let i = 0; i < this.linhasQuadro.length; i++) {
            let countTreinos = 0
            for (let z = 0; z < this.linhasQuadro[i].presenca_treino.length; z++) {
              if (this.linhasQuadro[i].presenca_treino[z].presenca_1letra == "P") {
                countTreinos=countTreinos+1;
              }
            }
            this.linhasQuadro[i].count_treinos = countTreinos;
          }

          //carrega totalizadores
          for (let i = 0; i < this.linhasQuadroStaff.length; i++) {
            let countTreinos = 0
            for (let z = 0; z < this.linhasQuadroStaff[i].presenca_treino.length; z++) {
              if (this.linhasQuadroStaff[i].presenca_treino[z].presenca_1letra == "P") {
                countTreinos=countTreinos+1;
              }
            }
            this.linhasQuadroStaff[i].count_treinos = countTreinos;
          }

    console.log("Quadro Staff - Final", this.linhasQuadroStaff);

  }

  ngOnInit(): void {

    this.spinner = true;
    console.log("PresencasComponent | CarregarPresencas");

    this.loadFromBDPresencas(this.filtro);

  }

  onValChange() {


    if (this.filtro == "datas") {
      this.filtro_datas = true;
    } else {
      this.filtro_datas = false;
      this.loadFromBDPresencas(this.filtro);
    }
  }

  aplicarFiltro() {
    this.loadFromBDPresencas("datas");
    this.filtro_datas = false;
  }

  loadFromBDPresencas(parmFiltro: string) {

    let parmDataInicio: string = "";
    let parmDataFim: string = "";
    this.spinner = true;

    switch (parmFiltro) {

      case "mes_atual": {
        var date = new Date();
        let firstDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        parmDataInicio = (moment(firstDay)).format('YYYYMMDD');
        parmDataFim = (moment(lastDay)).format('YYYYMMDD');
        break;
      }

      case "semana_atual": {
        var dt = new Date(); // current date of week
        var currentWeekDay = dt.getDay();
        var lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
        var wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
        var wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

        parmDataInicio = (moment(wkStart)).format('YYYYMMDD');
        parmDataFim = (moment(wkEnd)).format('YYYYMMDD');
        break;
      }
      case "datas": {

        parmDataInicio = (this.filtro_dataInicio["year"] * 10000 + this.filtro_dataInicio["month"] * 100 + this.filtro_dataInicio["day"]).toString();
        parmDataFim = (this.filtro_dataFim["year"] * 10000 + this.filtro_dataFim["month"] * 100 + this.filtro_dataFim["day"]).toString();
        break;
      }


      default: {
        //Carrega Tudo;
        parmDataInicio = "1";
        parmDataFim = "1";
        break;
      }

    }


    //limpar quadro
    while (this.linhasQuadro.length) {
      this.linhasQuadro.pop();
    }

    while (this.linhasQuadroStaff.length) {
      this.linhasQuadroStaff.pop();
    }


    this.presencaService.getPresencasByDatas(parmDataInicio, parmDataFim, this.equipaService.getEquipa().id).subscribe(
      {
        next: data => {
          this.presencas = data;
          if (data != null) {
            if (this.presencas[0] != null) {
              this.loadQuadro();
              this.spinner = false;
              this.semRegistos = false;
            } else {
              this.spinner = false;
              this.semRegistos = true;
              console.log("LoginComponent | sem registos!");
            }
          } else {
            this.spinner = false;
            this.semRegistos = true;
            console.log("LoginComponent | sem registos");
          }

          console.log("LoginComponent | carregou presencas, LinhasQuadro", this.linhasQuadro);



        },
        error: error => {
          console.log("LoginComponent | Serviço Login Erro!!");
          this.spinner = false;
        }
      });

  }


}
