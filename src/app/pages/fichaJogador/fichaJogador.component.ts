import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { EquipaService } from './../../services/equipa.service';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../../services/login-service.service';
import { FormsModule } from '@angular/forms';
import { DataPipe } from './DataPipe';

@Component({
  selector: 'user-cmp',
  templateUrl: 'fichaJogador.component.html',
  styleUrl: './fichaJogador.component.css',
  standalone: true,
  imports: [NgbProgressbarModule, CommonModule, FormsModule, CommonModule, NgbAlertModule, DataPipe, NgbCollapseModule]
})

export class FichaJogadorComponent implements OnInit {
  equipaData: EquipaData | undefined;
  jogadorData: jogadorData;

  public sbmSuccess: boolean = false;
  public sbmError: boolean = false;
  public faltas: FichaJogadorPresencasData[] = [];
  public hasFaltas: boolean = false;
  public spinner:boolean=false;
  public isCollapsed = true;

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private loginservice: LoginServiceService) {

    this.jogadorData = {
      id: 0,
      nome: "",
      nome_completo: "",
      data_nascimento: 0,
      email: "",
      telemovel: "",
      pai_nome: "",
      pai_email: "",
      pai_telemovel: "",
      mae_nome: "",
      mae_email: "",
      mae_telemovel: "",
      morada: "",
      cidade: "",
      codigo_postal: "",
      observacoes: "",
      numero: "",
      cc: "",
      nif: 0,
      licenca: 0,
    };
  }

  ngOnInit() {
    this.spinner=true;
    this.sbmError = false;
    this.sbmSuccess = false;
    const routeParams = this.route.snapshot.paramMap;
    const idJogador = Number(routeParams.get('id'));
    console.log('FichaJogadorComoponent | idJogador:', idJogador);


    this.equipaService.loadJogadorbyId(idJogador).subscribe(
      {
        next: data => {
          console.log("FichaJogadorComponent | loadJogadorbyId", data);
          if (data != null) {
            this.jogadorData = data;

            this.equipaService.getFaltasByJogador(idJogador).subscribe(
              {
                next: data => {
                  console.log("FichaJogadorComponent | getFaltasByJogador", data);
                  if (data != null) {
                    this.spinner=false;
                    this.faltas = data;
                    if (this.faltas.length == 0) {
                      this.hasFaltas = false;
                    } else {
                      this.hasFaltas = true;
                    }
                  }
                },
                error: error => {
                  console.log("FichaJogadorComponent | Serviço getFaltasByJogador Erro!!");
                  this.sbmError = true;
                }
              });





          }
        },
        error: error => {
          console.log("FichaJogadorComponent | Serviço loadJogadorbyId Erro!!");
          this.sbmError = true;
        }
      });




  }

  gravarFichaJogador() {

    this.spinner=true;
    this.equipaService.updateJogador(this.loginservice.getLoginData().id, this.jogadorData).subscribe(
      {
        next: data => {
          console.log("FichaJogadorComponent | gravarFichaJogador", data);
          if (data != null) {
            this.spinner=false;
            if (data == false) {
              this.sbmError = true;
              document.location.href = '#top';
            }
            if (data == true) {
              this.sbmSuccess = true;
              document.location.href = '#top';
            }
          } else {
          }
        },
        error: error => {
          console.log("FichaJogadorComponent | Serviço gravarFichaJogador Erro!!");
          this.sbmError = true;
        }
      });



  }
}



