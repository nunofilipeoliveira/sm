import { PresencaService } from './../../services/presenca.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipaService } from '../../services/equipa.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'jogador-seleccao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jogador-seleccao.component.html',
  styleUrl: './jogador-seleccao.component.css'
})
export class JogadorSeleccaoComponent implements OnInit{

  public spinner:boolean=false;
  public idEscalao:number=0;
  public jogadores:JogadorSeleccao[]=[];

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private presencaService: PresencaService, private router: Router){}



  ngOnInit() {
    this.spinner=true;
    const routeParams = this.route.snapshot.paramMap;
    this.idEscalao = Number(routeParams.get('id'));
    console.log('JogadorSeleccaoComponent | idEscalao:', this.idEscalao);



    this.equipaService.getJogadoresDisponiveis(this.idEscalao).subscribe(
      {
        next: data => {
          this.jogadores = data;
          console.log("JogadorSeleccaoComponent | jogadores disponiveis", this.jogadores);
          this.spinner=false;
          if (data != null) {

          } else {

          }
        },
        error: error => {
          console.log("FichaJogadorComponent | Serviço gravarFichaJogador Erro!!");

        }
      });

  }

  seleciona(indice_jogador:number){

    console.log("JogadorSeleccaoComponent | Seleciona");

    console.log("JogadorSeleccaoComponent | Seleciona | jogadores:", this.jogadores);
    console.log("JogadorSeleccaoComponent | Seleciona | indice:", indice_jogador);

    this.jogadores[indice_jogador];
    let tmpPresencaJogador:jogadorPresencaData={
      id_jogador: this.jogadores[indice_jogador].id_Jogador,
      nome_jogador:this.jogadores[indice_jogador].nome_Jogador,
      estado: "",
      motivo: "",
      estilo_estado: ""

    }
    let listaJogadoresPresenca:jogadorPresencaData[]=this.presencaService.getPresenca();
    listaJogadoresPresenca.push(tmpPresencaJogador);
    this.presencaService.setPresenca(listaJogadoresPresenca);

    this.router.navigate(['/mpresenca'])

  }


}
