import { Component, OnInit } from '@angular/core';
import { EquipaService } from '../../services/equipa.service';
import { ActivatedRoute } from '@angular/router';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../../services/login-service.service';
import { FicheirosService } from '../../services/ficheiros.service';


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
  public spinner: boolean = false;
  public isCollapsed = false;
  public isUploadFoto: boolean = false;
  public isAvatar: boolean = false;
  public isFotoPrincipal: boolean = false;
  public isUploadFoto_avatar = false;
  isEditing = false;
  private staffBackup: any = {};
  fotoUrl: string = '';
  avatarUrl: string = '';


  // Propriedade para a data de nascimento formatada (AAAA-MM-DD)
  public dataNascimentoDisplay: string = '';

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private loginservice: LoginServiceService, private ficheirosService: FicheirosService) {

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
    const idStaff = Number(routeParams.get('id'));
    console.log('FichaStaffComponent | idStaff:', idStaff);
    this.loadStaffImages(idStaff);


    this.equipaService.loadStaffbyId(idStaff).subscribe(
      {
        next: data => {
          console.log("FichaStaffComponent | loadStaffbyId", data);
          if (data != null) {
            this.staff = data;

            // CONVERSÃO DO NÚMERO AAAAMMDD PARA STRING AAAA-MM-DD PARA EXIBIÇÃO NO INPUT
            if (this.staff.data_nascimento && this.staff.data_nascimento.toString().length === 8) {
              const dataStr = this.staff.data_nascimento.toString();
              const ano = dataStr.substring(0, 4);
              const mes = dataStr.substring(4, 6);
              const dia = dataStr.substring(6, 8);
              this.dataNascimentoDisplay = `${ano}-${mes}-${dia}`;
            } else {
              this.dataNascimentoDisplay = 'AAAA-MM-DD'; // Limpa se o formato não for AAAAMMDD
            }

            this.spinner = false;
          }
        },
        error: error => {
          console.log("FichaStaffComponent | Serviço loadStaffbyId Erro!!");
          this.sbmError = true;
        }
      });

  }

  loadStaffImages(idStaff: number) {
    const timestamp = new Date().getTime();
    this.fotoUrl = `assets/img/jogadores/${idStaff}_staff.jpg?v=${timestamp}`;
    this.avatarUrl = `assets/img/jogadores/${idStaff}_avatar_staff.jpg?v=${timestamp}`;
  }

  startEditing() {
    this.isEditing = true;
    this.staffBackup = JSON.parse(JSON.stringify(this.staff));
  }
  cancelEditing() {
    this.isEditing = false;
    this.staff = JSON.parse(JSON.stringify(this.staffBackup));
    this.isUploadFoto_avatar = false;
    this.isUploadFoto = false;
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


    this.equipaService.updateStaff(this.loginservice.getLoginData().id, this.staff).subscribe(
      {
        next: data => {
          console.log("FichaStaffComponent | gravarFichaStaff", data);
          if (data != null) {
            this.spinner = false;
            this.isEditing = false;
            console.log("FichaStaffComponent | data:", data);
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
          console.log("FichaStaffComponent | Serviço gravarFichaStaff Erro!!");
          this.sbmError = true;
        }
      });

  }

  modoCarregarFicheiro() {
    this.isUploadFoto = !this.isUploadFoto;
    this.isFotoPrincipal = true;
    this.isAvatar = false;
  }

  modoCarregarFicheiro_avatar() {
    this.isUploadFoto_avatar = !this.isUploadFoto_avatar;
    this.isAvatar = true;
    this.isFotoPrincipal = false;
  }

  onFileSelected(event: any) {
    console.log("onFileSelected | File selected:", event);
    console.log("onFileSelected | Selected file:", event.target.files[0]);
    this.isUploadFoto = false;
    let file: File = event.target.files[0];

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('Ficheiro demasiado grande. Máximo 10MB.');
      return;
    }


    let formDate = new FormData();
    formDate.append('foto', file);
    let nomefoto = "";
    if (this.isAvatar) {
      nomefoto = (this.staff.id.toString()) + "_avatar_staff"
    } else {
      nomefoto = (this.staff.id.toString() + "_staff");
    }
    console.log("onFileSelected | Nome foto:", nomefoto);
    this.spinner = true;
    this.ficheirosService.uploadFoto({ parmIDFoto: nomefoto, foto: formDate }).subscribe(resp => {
      console.log("onFileSelected | Upload response:", resp);
      const timestamp = new Date().getTime();
      if (this.isAvatar) {

        this.avatarUrl = `assets/img/jogadores/${this.staff.id}_avatar_staff.jpg?v=${timestamp}`;
        console.log("onFileSelected | Updated avatarUrl:", this.avatarUrl);
      } else {
        this.fotoUrl = `assets/img/jogadores/${this.staff.id}_staff.jpg?v=${timestamp}`;
        console.log("onFileSelected | Updated fotoUrl:", this.fotoUrl);

      }
      this.spinner = false;


    })

    this.isUploadFoto = false;
    this.isUploadFoto_avatar = false;
    this.isAvatar = false;
    this.isFotoPrincipal = false;
    this.isEditing = false;

  }


}
