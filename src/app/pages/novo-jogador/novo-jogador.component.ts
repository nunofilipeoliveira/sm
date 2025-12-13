import { FicheirosService } from './../../services/ficheiros.service';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { EquipaService } from './../../services/equipa.service';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../../services/login-service.service';
import { FormsModule } from '@angular/forms';
import { EquipaData } from '../equipa/equipaData';



@Component({
  selector: 'user-cmp',
  templateUrl: 'novo-jogador.component.html',
  styleUrl: './novo-jogador.component.css',
  standalone: true,
  imports: [NgbProgressbarModule, CommonModule, FormsModule, CommonModule, NgbAlertModule, NgbCollapseModule]
})

export class NovoJogadorComponent implements OnInit {
  equipaData: EquipaData | undefined;
  jogadorData: jogadorData;

  public sbmSuccess: boolean = false;
  public sbmError: boolean = false;
  public faltas: FichaJogadorPresencasData[] = [];
  public hasFaltas: boolean = false;
  public spinner: boolean = false;
  public isCollapsed = true;
  public tirarFoto = false;
  public text_botao = "Mais dados";
  public isUploadFoto: boolean = false;
  public isAvatar: boolean = false;
  public isFotoPrincipal: boolean = false;
  public isUploadFoto_avatar = false;
  public count_presencas: ContadorPresencaData[] = [];
  public origem: string = "";
  public idEquipa: number = 0;
  public mensagemErro: string = "";

  // Propriedade para a data de nascimento formatada (AAAA-MM-DD)
  public dataNascimentoDisplay: string = 'AAAA-MM-DD';

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
    this.spinner = false;
    this.sbmError = false;
    this.sbmSuccess = false;
    this.isCollapsed = false;
    const routeParams = this.route.snapshot.paramMap;
    this.origem = String(routeParams.get('origem'));
    this.idEquipa = Number(routeParams.get('idEquipa'));
    console.log('NovoJogadorComponent | origem:', this.origem);
    console.log('NovoJogadorComponent | idEquipa:', this.idEquipa);


  }


  gravarFichaJogador() {

    console.log("avaliar loginData");
    if (this.loginservice.getLoginData() == undefined) {
      console.log("loginData==undefined");
      this.router.navigate(['/']);
    }

    // CONVERSÃO DA STRING AAAA-MM-DD DE VOLTA PARA NÚMERO AAAAMMDD ANTES DE SALVAR
    console.log("Antes de dataNascimentoDisplay");
    if (this.dataNascimentoDisplay!='' && this.dataNascimentoDisplay.trim() !== 'AAAA-MM-DD') {
      console.log("dataNascimentoDisplay:", this.dataNascimentoDisplay);
      // Remove os hífens para obter AAAAMMDD
      const dataNumericaStr = this.dataNascimentoDisplay.replace(/-/g, '');
      // Verifica se a string resultante tem 8 dígitos e é um número válido
      if (dataNumericaStr.length === 8 && !isNaN(Number(dataNumericaStr))) {
        this.jogadorData.data_nascimento = Number(dataNumericaStr);
      } else {
        console.warn('Data de nascimento inválida para conversão AAAAMMDD:', this.dataNascimentoDisplay);
        this.jogadorData.data_nascimento = 0; // Ou algum valor padrão para inválido
        this.sbmError = true;
        document.location.href = '#top';
        this.mensagemErro = 'Data de nascimento inválida. Por favor, insira uma data no formato AAAA-MM-DD.';
      }
    } else {
      this.jogadorData.data_nascimento = 0; // Ou 0 se o campo estiver vazio

    }


    if (this.sbmError == false) {
      this.spinner = true;
      this.equipaService.addJogador(this.jogadorData, this.loginservice.getLoginData().id).subscribe(
        {
          next: data => {
            console.log("FichaJogadorComponent | gravarFichaJogador", data);
            if (data != null) {
              let resultado: number = data;
              this.spinner = false;
              if (resultado == 0) {
                this.sbmError = true;
                this.mensagemErro = 'Erro ao gravar a ficha do jogador. Por favor, tente novamente.';
                console.warn("FichaJogadorComponent | gravarFichaJogador | resultado == false");

              }
              if (resultado >0) {
                this.sbmSuccess = true;
                console.log("FichaJogadorComponent | gravarFichaJogador | resultado == true");

                // Se veio da gestão de equipa, adicionar o jogador à equipa e navegar para gestão-equipa
                if (this.origem === 'jogadorSeleccao') {
                  // O idEquipa pode vir negativo (por causa da navegação), então converter para positivo
                  const idEquipaCorrigido = Math.abs(this.idEquipa);
                  console.log("NovoJogadorComponent | Adicionando jogador à equipa:", idEquipaCorrigido, "(original:", this.idEquipa + ")");

                  // Primeiro, precisamos obter o ID do jogador recém-criado
                  // O jogadorData.id deve ter sido definido após a criação
                  this.jogadorData.id = resultado;
                  console.log("NovoJogadorComponent | Jogador criado com ID:", this.jogadorData.id);

                  if (this.jogadorData.id > 0) {
                    this.equipaService.addJogadorEquipa(this.jogadorData, idEquipaCorrigido).subscribe({
                      next: (addResult) => {
                        console.log("NovoJogadorComponent | Jogador adicionado à equipa com sucesso");
                        // Navegar para gestão-equipa com a equipa selecionada
                        this.router.navigate(['/gestao-equipa/' + idEquipaCorrigido]);
                      },
                      error: (error) => {
                        console.error("NovoJogadorComponent | Erro ao adicionar jogador à equipa:", error);
                        // Mesmo com erro, navegar para gestão-equipa
                        this.router.navigate(['/gestao-equipa/' + idEquipaCorrigido]);
                      }
                    });
                  } else {
                    console.error("NovoJogadorComponent | ID do jogador não foi definido após criação");
                    // Mesmo assim, navegar para gestão-equipa
                    this.router.navigate(['/gestao-equipa/' + idEquipaCorrigido]);
                  }
                } else {
                  // Navegação padrão para outras origens
                  this.router.navigate(['/' + this.origem + '/' + this.idEquipa + '/' + this.jogadorData.nome]);
                }
              }else{
                console.warn("FichaJogadorComponent | gravarFichaJogador | resultado <> true");
              }
            } else {
              console.warn("FichaJogadorComponent | gravarFichaJogador | data == null");
            }
          },
          error: error => {
            console.log("FichaJogadorComponent | Serviço gravarFichaJogador Erro!!");
            this.sbmError = true;
            this.spinner = false;
            this.mensagemErro = 'Erro ao gravar a ficha do jogador. Por favor, tente novamente.';
          }
        });
    }
  }

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart !== null ? input.selectionStart : 0;
    const end = input.selectionEnd !== null ? input.selectionEnd : 0;
    const value = this.dataNascimentoDisplay;

    // Substitui o caractere na posição do cursor
    this.dataNascimentoDisplay = value.substring(0, start);
    console.log("NovoJogadorComponent | handleInput | input.value:", input.value);
    console.log("NovoJogadorComponent | handleInput | input.value.length:", input.value.length);

    if (input.value.length == 0) {
      console.log("NovoJogadorComponent | handleInput | dataNascimentoDisplay: AAAA-MM-DD");
      this.dataNascimentoDisplay = 'AAAA-MM-DD';
      input.setSelectionRange(0, 0);
    }
    console.log("NovoJogadorComponent | handleInput | dataNascimentoDisplay:", this.dataNascimentoDisplay);
    if (this.dataNascimentoDisplay.trim()  === 'AAAA-MM-DD') {
      console.log("NovoJogadorComponent | handleInput | vai substituir:", this.dataNascimentoDisplay);
      input.setSelectionRange(0, 0);
    } else {
      console.log("NovoJogadorComponent | handleInput | vai substituir:", this.dataNascimentoDisplay);
      input.value = input.value.replace(/A/gi, '');
      input.value = input.value.replace(/M/gi, '');
      input.value = input.value.replace(/D/gi, '');
      input.value = input.value.replace(/-/gi, '');
    }
    this.dataNascimentoDisplay = input.value;
    // // Move o cursor para a direita
    // input.setSelectionRange(start + 1, start + 1);
  }

  cancelar() {
    console.log("NovoJogadorComponent | Cancelar");
    // Se veio da gestão de equipa, voltar para a gestão-equipa da equipa correta
    if (this.origem === 'jogadorSeleccao') {
      const idEquipaCorrigido = Math.abs(this.idEquipa);
      this.router.navigate(['/gestao-equipa/' + idEquipaCorrigido]);
    } else {
      // Navegação padrão para outras origens
      this.router.navigate(['/' + this.origem + '/' + this.idEquipa]);
    }
  }
}
