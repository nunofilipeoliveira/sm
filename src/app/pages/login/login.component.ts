import { environment } from './../../../environments/environment';
import { PoppupEscalaoComponent } from './../poppup-escalao/poppup-escalao.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginServiceService } from '../../services/login-service.service';
import { EquipaService } from '../../services/equipa.service';




@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, CommonModule],
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
  constructor(private router: Router, private dialog: MatDialog, private loginws: LoginServiceService, private equipaservice:EquipaService) { }


  ngOnInit(){

    this.equipaservice.clear();
    localStorage.clear();

    console.log('URL ->',  environment.apiUrl);

  }

  doLogin() {
    this.spinner = true;
    console.log('user:', this.loginObj.user);
    console.log('password:', this.loginObj.password);

    this.loginws.login(this.loginObj.user, this.loginObj.password).subscribe(
      {
        next: data => {
          this.loginwsdata = data;
          if (data != null ) {
            this.spinner = false;
            this.erroLogin = false;
            localStorage.setItem('UserLogin', this.loginObj.user);
            this.loginws.setLogin(this.loginwsdata);
            this.redirect(this.loginwsdata);

          } else {
            this.spinner = false;
            this.erroLogin = true;
            this.loginObj.user = ''
            this.loginObj.password = ''
          }
        },
        error: error => {
          console.log("LoginComponent | Serviço Login Erro!!");
          this.spinner = false;
          this.srvIndisponivel = true;
          this.erroLogin = false;
          this.loginObj.user = ''
          this.loginObj.password = ''
        }
      });

  }

  redirect(longids: loginData) {
    if (longids.escalaoEpoca.length > 1) {

      this.dialog.open(PoppupEscalaoComponent, {
        width: '250px',
        height: '200px',
        data:longids.escalaoEpoca

      })
    } else {
      localStorage.setItem('descritivo_escalao', longids.escalaoEpoca[0].descritivo_escalao);
      localStorage.setItem('idequipa_escalao', longids.escalaoEpoca[0].id_escalao_epoca.toString());
      this.router.navigate(['equipa']);
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

