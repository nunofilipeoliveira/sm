import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginServiceService } from '../services/login-service.service';
import { ActivatedRoute, Route, Params } from '@angular/router';

@Component({
  selector: 'novo-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-user.component.html',
  styleUrl: './novo-user.component.css'
})
export class NovoUserComponent implements OnInit {

  public password1: string = ''
  public password2: string = ''
  public erroPWD_erradas: boolean = false;
  public spinner: boolean = false;
  public linkErrado: boolean = false;
  public mensagem:string="";
  public success:boolean=false;
  public novouser: novouserData = {
    user: "",
    estado: "",
    code: "",
    idsEscalao: "",
    nome: ""
  }


  constructor(private loginService: LoginServiceService, private activatedRoute :ActivatedRoute) { }

  ngOnInit() {
    console.log("Página de ativar user")

    let parmCode:string="";

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      console.log("parametros de entrada",params);
      console.log("parametros de entrada: code ->",params["code"]);

      parmCode=params["code"]
    });

    this.spinner = true;
    this.loginService.validateCode(parmCode).subscribe(
      {
        next: data => {
          this.novouser = data;
          console.log("NovoUserComponent | data", data);
          console.log("NovoUserComponent | novoser", this.novouser);
          if (data != null) {
            this.spinner = false;
            console.log("NovoUserComponent | if");
          } else {
            this.linkErrado=true;
          }
        },
        error: error => {
          console.log("NovoUserComponent | Serviço Login Erro!!");

        }
      });

  }


  valida() {

    if (this.password1 != this.password2) {
      this.erroPWD_erradas = true;
      this.mensagem="Passwords não são iguais"
      this.password1="";
      this.password2="";
    } else {

      if(this.password1.length==0){
      this.erroPWD_erradas = true;
      this.mensagem="Preencha a Password"

      }else{
        this.erroPWD_erradas = false;

        this.spinner = true;
        this.loginService.createUser(this.novouser, this.password1).subscribe(
          {
            next: data => {
              this.novouser = data;
              if (data != null) {
                this.spinner = false;
                this.success=true;
                this.mensagem="User ativo com sucesso"


              } else {
                this.linkErrado=true;
                this.spinner = false;
              }
            },
            error: error => {
              console.log("NovoUserComponent | Serviço Login Erro!!");

            }
          });

      }

    }

  }

}
