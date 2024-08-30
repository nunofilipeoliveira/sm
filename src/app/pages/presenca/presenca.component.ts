import { Component, OnInit } from '@angular/core';
import { PresencaService } from '../../services/presenca.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'presenca',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './presenca.component.html',
  styleUrl: './presenca.component.css'
})
export class PresencaComponent implements OnInit {

  presencaData: PresencaData | undefined;
  public spinner:boolean=false;
  public historico:string[]=[];

  constructor(private route: ActivatedRoute, private presencaService: PresencaService, private router: Router) { }

  ngOnInit() {

    const routeParams = this.route.snapshot.paramMap;
    const idFichaPresenca = Number(routeParams.get('id'));
    console.log('PresencaComponent | idFichaPresenca:', idFichaPresenca);


    this.spinner=true;
    this.presencaService.getPresencasByid(idFichaPresenca).subscribe(
      {
        next: data => {
          this.presencaData = data;
          console.log("PresencaComponent | carregou Presenca", this.presencaData);
          console.log("PresencaComponent | spinner", this.spinner);

          this.presencaService.getHistoricoByid(idFichaPresenca).subscribe(
            {
              next: data => {
                this.historico = data;
                console.log("PresencaComponent | historico", this.historico);

                this.spinner=false;
                if (data != null) {

                } else {

                }
              },
              error: error => {
                console.log("PresencaComponent | Serviço Login Erro!!");

              }
            });

          if (data != null) {

          } else {

          }
        },
        error: error => {
          console.log("PresencaComponent | Serviço Login Erro!!");

        }
      });







    console.log('PresencaComponent | presencaData:', this.presencaData);

  }

  alterarFicha()
  {
    this.router.navigate(['/mpresenca/'+this.presencaData?.id])
  }

}
