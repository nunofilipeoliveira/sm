import { Component, OnInit } from '@angular/core';
import { EquipaService } from '../../services/equipa.service';
import { ActivatedRoute } from '@angular/router';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../../services/login-service.service';

@Component({
  selector: 'ficha-staff',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbAlertModule, NgbCollapseModule],
  templateUrl: './ficha-staff.component.html',
  styleUrl: './ficha-staff.component.css'
})

export class FichaStaffComponent implements OnInit {

  staff: staffData;
  public sbmSuccess: boolean = false;
  public sbmError: boolean = false;
  public faltas: FichaJogadorPresencasData[] = [];
  public hasFaltas: boolean = false;
  public spinner:boolean=false;
  public isCollapsed = true;

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private loginservice: LoginServiceService) {

    this.staff = {
      id: 0,
      nome: "",
      nome_completo: "",
      data_nascimento: 0,
      email: "",
      telemovel: "",
      morada: "",
      codigo_postal: "",
      id_jogador:0,
      tipo:""
    };
  }

  ngOnInit() {
    this.spinner=true;
    this.sbmError = false;
    this.sbmSuccess = false;
    const routeParams = this.route.snapshot.paramMap;
    const idStaff = Number(routeParams.get('id'));
    console.log('FichaStaffComponent | idStaff:', idStaff);


    this.equipaService.loadStaffbyId(idStaff).subscribe(
      {
        next: data => {
          console.log("FichaStaffComponent | loadStaffbyId", data);
          if (data != null) {
            this.staff = data;
            this.spinner=false;
          }
        },
        error: error => {
          console.log("FichaStaffComponent | Serviço loadStaffbyId Erro!!");
          this.sbmError = true;
        }
      });

  }

  gravarFichaStaff(){

    this.spinner=true;
    this.equipaService.updateStaff(this.loginservice.getLoginData().id, this.staff).subscribe(
      {
        next: data => {
          console.log("FichaStaffComponent | gravarFichaStaff", data);
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
          console.log("FichaStaffComponent | Serviço gravarFichaStaff Erro!!");
          this.sbmError = true;
        }
      });

  }


}
