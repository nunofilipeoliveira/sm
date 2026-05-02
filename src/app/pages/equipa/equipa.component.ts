import { CommonModule } from '@angular/common';
import { EquipaService } from './../../services/equipa.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import moment, { Moment } from 'moment';
import { IdadePipe } from './idadePipe';
import { EpocaData } from '../administracao/EpocaData';
import { EquipaData } from './equipaData';
import { environment } from '../../../environments/environment';






@Component({
  selector: 'equipa-cmp',
  templateUrl: 'equipa.component.html',
  styleUrl: './equipa.component.css',
  standalone: true,
  imports: [IdadePipe, CommonModule]

})

export class EquipaComponent implements OnInit {

  idEquipa: string | null;
  hoje: number = 0;
  equipaData!: EquipaData;
  idadeEscalao: string = "";
  epocaAtual: EpocaData = { id: 0, epocaDescritivo: '', anoInicio: 0 };
  modoApresentarIdadeEscalao  = false;

  spinner: boolean = false;
  constructor(private router: Router, private equipaService: EquipaService) {
    this.idEquipa = localStorage.getItem("idequipa_escalao");
    var today = new Date();
    this.hoje = parseInt((moment(today)).format('YYYYMMDD'));
    console.log("hoje", this.hoje);

  }

  doFichaAtleta(parmId: number) {
    this.router.navigate(['fichaJogador/', parmId]);
  }

  doFichaStaff(parmId: number, parmId_Jogador: number) {
    if (parmId_Jogador == 0) {
      this.router.navigate(['fichaStaff/', parmId]);
    } else {
      this.router.navigate(['fichaJogador/', parmId_Jogador]);
    }
  }

  ngOnInit(): void {
    // Validate tenant access for this equipa
    const currentTenantId = +environment.tenant_id;
    
    

    if (this.equipaData == undefined || this.equipaData.id == 0) {
      console.log("LoginComponent | equipa3", this.equipaData);
      this.spinner = true;
      this.equipaService.getEquipabyIDLight(this.idEquipa).subscribe(
        {
          next: data => {
            this.equipaData = data;
            this.equipaData.jogadores.sort((a, b) => (a.data_nascimento - b.data_nascimento));
            console.log("LoginComponent | carregou equipa", this.equipaData);
            console.log("LoginComponent | spinner", this.spinner);
            this.equipaService.setEquipa(this.equipaData);
            this.spinner = false;


          if (  this.equipaData.jogadores[1].tenant_id !== currentTenantId) {
          console.warn('EquipaComponent | - Acesso nao autorizado - equipa pertence a outro tenant');
          console.warn('EquipaComponent | - equipa:', this.equipaData);
          console.warn('EquipaComponent | - jogador tenant_id:', this.equipaData.jogadores[1].tenant_id  );
          this.router.navigate(['/erro-acesso']);
          return;
        }


            if (data != null) {

            } else {

            }
          },
          error: error => {
            console.log("LoginComponent | Serviço Login Erro!!");

          }
        });
    }
  }

}



