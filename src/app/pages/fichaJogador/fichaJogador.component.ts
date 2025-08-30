import { FicheirosService } from './../../services/ficheiros.service';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { EquipaService } from './../../services/equipa.service';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../../services/login-service.service';
import { FormsModule } from '@angular/forms';
import { DataPipe } from './DataPipe'; // Seu DataPipe personalizado

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
  public spinner: boolean = false;
  public isCollapsed = false;
  public tirarFoto = false;
  public text_botao = "Mais dados";
  public isUploadFoto: boolean = false;
  public isAvatar: boolean = false;
  public isFotoPrincipal: boolean = false;
  public isUploadFoto_avatar = false;
  public count_presencas: ContadorPresencaData[] = [];
  load_presencas: boolean = false;
  total_faltas: number = 0;
  total_presencas: number = 0;

  isEditing = false;
  private jogadorDataBackup: any = {};
  fotoUrl: string = '';
  avatarUrl: string = '';

  // Nova propriedade para controlar a visibilidade da tabela de faltas
  public showFaltas: boolean = false; // Inicialmente oculta
  public showPresencas: boolean = false; // Inicialmente oculta
  public showInfo: boolean = false; // Inicialmente visível

  // Propriedade para a data de nascimento formatada (AAAA-MM-DD)
  public dataNascimentoDisplay: string = '';

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private loginservice: LoginServiceService, private router: Router, private ficheirosService: FicheirosService) {
    this.jogadorData = {
      id: 0,
      nome: "",
      nome_completo: "",
      data_nascimento: 0, // É um número no formato AAAAMMDD
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
    this.load_presencas = true;
    this.spinner = true;
    this.sbmError = false;
    this.sbmSuccess = false;
    const routeParams = this.route.snapshot.paramMap;
    const idJogador = Number(routeParams.get('id'));
    console.log('FichaJogadorComoponent | idJogador:', idJogador);
    this.loadJogadorImages(idJogador);

    this.equipaService.loadJogadorbyId(idJogador).subscribe(
      {
        next: data => {
          console.log("FichaJogadorComponent | loadJogadorbyId", data);
          if (data != null) {
            this.jogadorData = data;
            console.log("FichaJogadorComponent | loadJogadorbyId 2 ", this.jogadorData);

            // CONVERSÃO DO NÚMERO AAAAMMDD PARA STRING AAAA-MM-DD PARA EXIBIÇÃO NO INPUT
            if (this.jogadorData.data_nascimento && this.jogadorData.data_nascimento.toString().length === 8) {
              const dataStr = this.jogadorData.data_nascimento.toString();
              const ano = dataStr.substring(0, 4);
              const mes = dataStr.substring(4, 6);
              const dia = dataStr.substring(6, 8);
              this.dataNascimentoDisplay = `${ano}-${mes}-${dia}`;
            } else {
              this.dataNascimentoDisplay = 'AAAA-MM-DD'; // Limpa se o formato não for AAAAMMDD
            }

            this.equipaService.getFaltasByJogador(idJogador).subscribe(
              {
                next: data => {
                  console.log("FichaJogadorComponent | getFaltasByJogador", data);
                  if (data != null) {
                    this.spinner = false;
                    this.faltas = data;
                    this.total_faltas = this.faltas.length
                    if (this.faltas.length == 0) {
                      this.hasFaltas = false;
                    } else {
                      this.hasFaltas = true;
                    }
                  }

                  this.equipaService.getCountPresencasByJogador(idJogador).subscribe(
                    {
                      next: data => {
                        console.log("FichaJogadorComponent | getCountPresencasByJogador", data);
                        if (data != null) {
                          this.spinner = false;
                          this.count_presencas = data;
                          for (let i = 0; i < this.count_presencas.length; i++) {
                            this.total_presencas += this.count_presencas[i].set + this.count_presencas[i].out + this.count_presencas[i].nov + this.count_presencas[i].dez + this.count_presencas[i].jan + this.count_presencas[i].fev + this.count_presencas[i].mar + this.count_presencas[i].abr + this.count_presencas[i].mai + this.count_presencas[i].jun + this.count_presencas[i].jul;
                          }
                          this.load_presencas = false;

                        }
                      },
                      error: error => {
                        console.log("FichaJogadorComponent | Serviço getCountPresencasByJogador Erro!!");
                        this.sbmError = true;
                        this.load_presencas = false;
                      }
                    });

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

  loadJogadorImages(idJogador: number) {
    const timestamp = new Date().getTime();
    this.fotoUrl = `assets/img/jogadores/${idJogador}.jpg?v=${timestamp}`;
    this.avatarUrl = `assets/img/jogadores/${idJogador}_avatar.jpg?v=${timestamp}`;
  }


  startEditing() {
    this.isEditing = true;
    this.jogadorDataBackup = JSON.parse(JSON.stringify(this.jogadorData));
  }
  cancelEditing() {
    this.isEditing = false;
    this.jogadorData = JSON.parse(JSON.stringify(this.jogadorDataBackup));
    this.isUploadFoto_avatar = false;
    this.isUploadFoto = false;
  }

  detalhe() {
    if (this.isCollapsed == true) {
      this.isCollapsed = false;
      this.text_botao = "Menos Dados";
    } else {
      this.isCollapsed = true;
      this.text_botao = "Mais Dados";
    }
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
      nomefoto = (this.jogadorData.id.toString()) + "_avatar"
    } else {
      nomefoto = (this.jogadorData.id.toString());
    }
    console.log("onFileSelected | Nome foto:", nomefoto);
    this.spinner = true;
    this.ficheirosService.uploadFoto({ parmIDFoto: nomefoto, foto: formDate }).subscribe(resp => {
      console.log("onFileSelected | Upload response:", resp);
      const timestamp = new Date().getTime();
      if (this.isAvatar) {

        this.avatarUrl = `assets/img/jogadores/${this.jogadorData.id}_avatar.jpg?v=${timestamp}`;
        console.log("onFileSelected | Updated avatarUrl:", this.avatarUrl);
      } else {
        this.fotoUrl = `assets/img/jogadores/${this.jogadorData.id}.jpg?v=${timestamp}`;
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

  gravarFichaJogador() {
    this.spinner = true;
    console.log("avaliar loginData");
    if (this.loginservice.getLoginData() == undefined) {
      console.log("loginData==undefined");
      this.router.navigate(['/']);
    }

    // CONVERSÃO DA STRING AAAA-MM-DD DE VOLTA PARA NÚMERO AAAAMMDD ANTES DE SALVAR
    console.log("Antes de dataNascimentoDisplay");
    if (this.dataNascimentoDisplay) {
      console.log("dataNascimentoDisplay:", this.dataNascimentoDisplay);
      // Remove os hífens para obter AAAAMMDD
      const dataNumericaStr = this.dataNascimentoDisplay.replace(/-/g, '');
      // Verifica se a string resultante tem 8 dígitos e é um número válido
      if (dataNumericaStr.length === 8 && !isNaN(Number(dataNumericaStr))) {
        this.jogadorData.data_nascimento = Number(dataNumericaStr);
      } else {
        console.warn('Data de nascimento inválida para conversão AAAAMMDD:', this.dataNascimentoDisplay);
        this.jogadorData.data_nascimento = 0; // Ou algum valor padrão para inválido
      }
    } else {
      this.jogadorData.data_nascimento = 0; // Ou 0 se o campo estiver vazio
    }

    this.equipaService.updateJogador(this.loginservice.getLoginData().id, this.jogadorData).subscribe(
      {
        next: data => {
          console.log("FichaJogadorComponent | gravarFichaJogador", data);
          if (data != null) {
            this.spinner = false;
            this.isEditing = false;
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
          console.log("FichaJogadorComponent | Serviço gravarFichaJogador Erro!!");
          this.sbmError = true;
        }
      });
  }

  // Novo método para alternar a visibilidade das faltas
  toggleFaltasVisibility() {
    this.showFaltas = !this.showFaltas;
  }

  toggleInfoVisibility() {
    this.showInfo = !this.showInfo;
  }

  togglePresencasVisibility() {
    this.showPresencas = !this.showPresencas;
  }
}
