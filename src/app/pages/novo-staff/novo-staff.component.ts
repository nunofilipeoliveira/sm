import { Component, OnInit } from '@angular/core';
import { EquipaService } from '../../services/equipa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../../services/login-service.service';
import { FicheirosService } from '../../services/ficheiros.service';


@Component({
  selector: 'novo-staff',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbAlertModule, NgbCollapseModule],
  templateUrl: './novo-staff.component.html',
  styleUrl: './novo-staff.component.css'
})

export class NovoStaffComponent implements OnInit {

  staff: staffData;
  public sbmSuccess: boolean = false;
  public sbmError: boolean = false;
  public faltas: FichaJogadorPresencasData[] = [];
  public hasFaltas: boolean = false;
  public spinner: boolean = false;
  public isCollapsed = true;
  public isUploadFoto: boolean = false;
  public isAvatar: boolean = false;
  public isFotoPrincipal: boolean = false;
  public isUploadFoto_avatar=false;
  public origem: string = "";
  public idEquipa: number = 0;

   // Propriedade para a data de nascimento formatada (AAAA-MM-DD)
  public dataNascimentoDisplay: string = '';

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private loginservice: LoginServiceService, private ficheirosService: FicheirosService, private router: Router) {

    this.staff = {
      id: 0,
      nome: "",
      nome_completo: "",
      data_nascimento: 0,
      email: "",
      telemovel: "",
      morada: "",
      codigo_postal: "",
      id_jogador: 0,
      tipo: ""
    };
  }

  ngOnInit() {
    this.spinner = true;
    this.sbmError = false;
    this.sbmSuccess = false;
    const routeParams = this.route.snapshot.paramMap;
    this.origem = String(routeParams.get('origem'));
    this.idEquipa = Number(routeParams.get('idEquipa'));

    this.dataNascimentoDisplay="AAAAA-MM-DD"; // Inicializa com um valor padrão
    this.spinner = false;
    this.isCollapsed= false;
  }

  gravarFichaStaff() {

    this.spinner = true;

    // CONVERSÃO DA STRING AAAA-MM-DD DE VOLTA PARA NÚMERO AAAAMMDD ANTES DE SALVAR
    console.log("Antes de dataNascimentoDisplay");
    if (this.dataNascimentoDisplay) {
      console.log("dataNascimentoDisplay:", this.dataNascimentoDisplay);
      // Remove os hífens para obter AAAAMMDD
      const dataNumericaStr = this.dataNascimentoDisplay.replace(/-/g, '');
      // Verifica se a string resultante tem 8 dígitos e é um número válido
      if (dataNumericaStr.length === 8 && !isNaN(Number(dataNumericaStr))) {
        this.staff.data_nascimento = Number(dataNumericaStr);
      } else {
        console.warn('Data de nascimento inválida para conversão AAAAMMDD:', this.dataNascimentoDisplay);
        this.staff.data_nascimento = 0; // Ou algum valor padrão para inválido
      }
    } else {
      this.staff.data_nascimento = 0; // Ou 0 se o campo estiver vazio
    }

    this.router.navigate(['/'+this.origem+'/' + this.idEquipa+'/'+this.staff.nome]);


    this.equipaService.addStaff(this.staff, this.loginservice.getLoginData().id).subscribe(
      {
        next: data => {
          console.log("FichaStaffComponent | addStaff", data);
          if (data != null) {
            this.spinner = false;
            if (data == false) {
              this.sbmError = true;
              document.location.href = '#top';
            }
            if (data == true) {
              this.sbmSuccess = true;
              this.router.navigate(['/'+this.origem+'/' + this.idEquipa+'/'+this.staff.nome]);
              document.location.href = '#top';
            }
          } else {
          }
        },
        error: error => {
          console.log("FichaStaffComponent | Serviço addStaff Erro!!");
          this.sbmError = true;
        }
      });

  }

    cancelar() {
    console.log("NovoStaffComponent | Cancelar");
     this.router.navigate(['/'+this.origem+'/' + this.idEquipa]);
  }

  modoCarregarFicheiro() {
    this.isUploadFoto = true;
    this.isFotoPrincipal = true;
    this.isAvatar = false;
  }

  modoCarregarFicheiro_avatar() {
    this.isUploadFoto_avatar = true;
    this.isAvatar=true;
    this.isFotoPrincipal=false;
  }

  onFileSelected(event: any) {
    console.log(event.target.files[0])
    this.isUploadFoto = false;
    let file: File = event.target.files[0];
    let formDate = new FormData();
    formDate.append('foto', file);
    let nomefoto = "";
    if (this.isAvatar) {
      nomefoto = (this.staff.id.toString()) + "_avatar_staff"
    } else {
      nomefoto = (this.staff.id.toString() + "_staff");
    }
    this.ficheirosService.uploadFoto(nomefoto, formDate).subscribe(resp => {
      window.location.reload();
    })
  }


}
