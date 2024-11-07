import { Component, OnInit } from '@angular/core';
import { LoginServiceService } from '../../services/login-service.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoricoLoginsPipe } from './historico-logins.pipe';

@Component({
  selector: 'historico-logins',
  standalone: true,
  imports: [CommonModule, FormsModule, HistoricoLoginsPipe],
  templateUrl: './historico-logins.component.html',
  styleUrl: './historico-logins.component.css'
})
export class HistoricoLoginsComponent implements OnInit {

  constructor(private loginws: LoginServiceService, private router: Router) { }

  public historico: historicologinsdata[] = [];
  public filtro_nome: string="";
  public spinner:boolean=false;

  ngOnInit() {

    if (this.loginws.getLoginData().user != "Nuno") {
      this.router.navigate(['equipa']);
    }


    this.loginws.getHistoricoLogins().subscribe(
      {
        next: data => {
          this.historico = data;

          if (data != null) {

          } else {

          }
        },
        error: error => {
          console.log("LoginComponent | carregarhistorico");

        }
      });


  }

}
