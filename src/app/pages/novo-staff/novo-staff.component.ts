import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { EquipaService } from '../../services/equipa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../../services/login-service.service';
import { FicheirosService } from '../../services/ficheiros.service';


@Component({
  selector: 'novo-staff',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbAlertModule, NgbCollapseModule, NgbDatepickerModule],
  templateUrl: './novo-staff.component.html',
  styleUrl: './novo-staff.component.css'
})

export class NovoStaffComponent implements OnInit {
  @ViewChild('dp') dp?: NgbDatepicker;

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
  public dataNascimento: NgbDateStruct | null = null;
  public showDatepicker: boolean = false;

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
      tipo: "",
      licenca: ""
    };
  }

  ngOnInit() {
    this.spinner = true;
    this.sbmError = false;
    this.sbmSuccess = false;
    const routeParams = this.route.snapshot.paramMap;
    this.origem = String(routeParams.get('origem'));
    this.idEquipa = Number(routeParams.get('idEquipa'));

    this.dataNascimentoDisplay = ''; // Inicializa vazio
    this.spinner = false;
    this.isCollapsed= false;
  }

  toggleDatepicker() {
    this.showDatepicker = !this.showDatepicker;

    if (this.showDatepicker) {
      // Garante que o calendário abre sempre no mês/ano da data já preenchida
      // (ou no mês atual, caso ainda não exista data). É necessário aguardar
      // um ciclo, pois o *ngIf só cria o <ngb-datepicker> depois de showDatepicker mudar.
      setTimeout(() => {
        this.dp?.navigateTo(this.dataNascimento ?? undefined);
      });
    }
  }

  onDateChange(date: NgbDateStruct | null) {
    console.log("NovoStaffComponent | onDateChange | date:", date);
    if (date) {
      // Converter NgbDateStruct para string AAAA-MM-DD
      const year = date.year;
      const month = String(date.month).padStart(2, '0');
      const day = String(date.day).padStart(2, '0');
      this.dataNascimentoDisplay = `${year}-${month}-${day}`;
      console.log("NovoStaffComponent | onDateChange | dataNascimentoDisplay:", this.dataNascimentoDisplay);
    } else {
      this.dataNascimentoDisplay = '';
    }
    this.showDatepicker = false; // Fechar calendário após selecionar
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

    this.equipaService.addStaff(this.staff, this.loginservice.getLoginData().id).subscribe(
      {
        next: data => {
          console.log("NovoStaffComponent | addStaff", data);
          if (data != null) {
            this.spinner = false;
            if (data == false || data === 0) {
              this.sbmError = true;
              alert('Erro ao criar staff. Por favor, tente novamente.');
            }
              if (data == true || data > 0) {
              this.sbmSuccess = true;
              
              // Se veio da gestão de equipa, navegar para a lista de staff para adicionar à equipa
              if (this.origem === 'staffSeleccao') {
                const idEquipaCorrigido = Math.abs(this.idEquipa);
                console.log("NovoStaffComponent | Navegando para staffSeleccao após criar staff:", idEquipaCorrigido);
                
                // Navegar para a lista de staff com o nome do novo staff pré-filtrado
                this.router.navigate(['/staffSeleccao/-' + idEquipaCorrigido + '/' + this.staff.nome]);
              } else {
                // Navegação padrão para outras origens
                this.router.navigate(['/'+this.origem+'/' + this.idEquipa+'/'+this.staff.nome]);
              }
            }
          } else {
            this.spinner = false;
            this.sbmError = true;
            alert('Erro ao criar staff. Por favor, tente novamente.');
          }
        },
        error: error => {
          console.log("NovoStaffComponent | Serviço addStaff Erro!!", error);
          this.sbmError = true;
          this.spinner = false;
          alert('Erro ao criar staff. Por favor, tente novamente.');
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
    this.ficheirosService.uploadFoto({ parmIDFoto: nomefoto, foto: formDate }).subscribe(resp => {
      window.location.reload();
    })
  }


}
