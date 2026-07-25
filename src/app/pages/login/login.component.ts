import { PoppupEscalaoComponent } from './../poppup-escalao/poppup-escalao.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Adicionar MatDialogModule
import { Router } from '@angular/router';
import { LoginServiceService } from '../../services/login-service.service';
import { EquipaService } from '../../services/equipa.service';
import { ActivatedRoute } from '@angular/router';
import { ClubConfigService } from '../../services/club-config.service';


@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule], // Adicionar MatDialogModule aqui
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginwsdata!: loginData;
  nomeutilizador: string = "";
  loginObj: Login = new Login();
  erroLogin: boolean = false;
  srvIndisponivel: boolean = false;
  spinner: boolean = false;
  showSessionExpiredMessage = false;
  // Propriedades para as cores do login
  loginBackgroundColor: string = '#f3f3f3';
  loginGradient: string = '';
  loginButtonColor: string = '#273890';
  loginButtonHoverColor: string = '#b52732';
  loginInputPlaceholderColor: string = '#273890';
  // Imagem de fundo do login
  loginBackgroundImage: string = '';

  constructor(private router: Router, private dialog: MatDialog, private loginws: LoginServiceService, private equipaservice:EquipaService, private route: ActivatedRoute, public clubConfigService: ClubConfigService) { }

  ngOnInit(){

    console.log('LoginComponent | ngOnInit');
    
    // Carrega as cores do clube atual
    this.loginBackgroundColor = this.clubConfigService.getCurrentLoginBackgroundColor();
    this.loginGradient = this.clubConfigService.getCurrentLoginGradient();
    this.loginButtonColor = this.clubConfigService.getCurrentLoginButtonColor();
    this.loginButtonHoverColor = this.clubConfigService.getCurrentLoginButtonHoverColor();
    this.loginInputPlaceholderColor = this.clubConfigService.getCurrentLoginInputPlaceholderColor();
    // Carrega a imagem de fundo do clube atual
    this.loginBackgroundImage = this.clubConfigService.getCurrentLoginBackgroundImage();
    

    //Apaga elementos da equipa da sessão anterior
   // this.equipaservice.clear();
    //this.loginws.clear(); // Garante que a sessão anterior é limpa ao carregar a página

    

    console.log('LoginComponent | ngOnInit');
this.route.queryParams.subscribe(params => {
  console.log('Parâmetros de consulta:', params);
  this.showSessionExpiredMessage = params['sessionExpired'] === 'true';
  console.log('LoginComponent | ngOnInit | sessionExpired:', this.showSessionExpiredMessage);
});

      // Opcional: Limpa os parâmetros da URL após 5 segundos
      setTimeout(() => {
        this.showSessionExpiredMessage = false;
        console.log('LoginComponent | ngOnInit | Limpa mensagem de sessão expirada:', this.showSessionExpiredMessage);
      }, 5000);
   
  }

  

  doLogin() {
    this.spinner = true;
   

    this.loginws.login(this.loginObj.user, this.loginObj.password).subscribe(
      {
        next: data => {
          console.log("LoginComponent | Serviço Login OK!!");
          this.loginwsdata = data;
          
          if (data != null && data.token) { // Verifica se data e data.token existem
            this.spinner = false;
            this.erroLogin = false;
            

            // Armazena o token no localStorage
            this.loginws.setAuthToken(data.token);

            // Armazena os dados de login (incluindo o token, se a interface loginData foi atualizada)
            this.loginws.setLogin(this.loginwsdata);

            localStorage.removeItem('token');
            localStorage.setItem('token', JSON.stringify(this.loginwsdata));

            // Opcional: Manter UserLogin se ainda for usado para algo específico
            localStorage.removeItem('UserLogin');
            localStorage.setItem('UserLogin', this.loginObj.user);

            this.redirect(this.loginwsdata);

          } else {
            this.spinner = false;
            this.erroLogin = true;
            this.loginObj.user = ''
            this.loginObj.password = ''
            console.warn("Login falhou: Token não recebido ou dados inválidos.");
          }
        },
        error: error => {
          console.error("LoginComponent | Serviço Login Erro!!", error);
          this.spinner = false;
          this.srvIndisponivel = true;
          this.erroLogin = false;
          this.loginObj.user = ''
          this.loginObj.password = ''
        }
      });

      console.log("LoginComponent | doLogin | Fim");
      console.log("LoginComponent | doLogin | loginObj:", this.loginws.getLoginData());

  }

  redirect(longids: loginData) {
    if (longids.escalaoEpoca && longids.escalaoEpoca.length > 1) {
      this.dialog.open(PoppupEscalaoComponent, {
        width: '250px',
        height: '200px',
        data:longids.escalaoEpoca
      });
    } else if (longids.escalaoEpoca && longids.escalaoEpoca.length === 1) {
      localStorage.setItem('descritivo_escalao', longids.escalaoEpoca[0].descritivo_escalao);
      localStorage.setItem('idequipa_escalao', longids.escalaoEpoca[0].id_escalao_epoca.toString());
      this.router.navigate(['dashboard']);
    } else {
      console.warn("Nenhum escalão encontrado para redirecionamento.");
      this.erroLogin = true; // Ou outra mensagem de erro
    }
  }
}

export class Login {
  user: string;
  password: string;

  constructor() {
    this.user = '';
    this.password = '';
  }
}
