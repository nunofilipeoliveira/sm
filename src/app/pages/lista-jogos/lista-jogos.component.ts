import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { EquipaService } from '../../services/equipa.service';


@Component({
  selector: 'lista-jogos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './lista-jogos.component.html',
  styleUrl: './lista-jogos.component.css'
})
export class ListaJogosComponent {
  constructor(private router: Router, private jogoService: JogoService, private equipaService: EquipaService) { }
  jogos: JogoData[] = [];
  tmpEquipa: EquipaData | undefined;


  verJogo(parmId: number) {
    this.router.navigate(['jogo/', parmId]);
  }

  ngOnInit(): void {
    this.tmpEquipa = this.equipaService.getEquipa();
    if (this.tmpEquipa === undefined) {
      this.equipaService.getEquipabyIDLight(localStorage.getItem("idequipa_escalao")).subscribe({
        next: (equipa) => {
          this.tmpEquipa = equipa;
          console.log("ListaJogosComponent - ngOnInit - equipa:", this.tmpEquipa?.id);
          this.loadJogos();
        },
        error: (error) => {
          console.error('Error fetching equipa:', error);
        }
      });
    } else {
      console.log("ListaJogosComponent - ngOnInit - equipa:", this.tmpEquipa?.id);
      this.loadJogos();
    }
  }


  ngOnChanges() {
    console.log("ListaJogosComponent - ngOnChanges - equipa:", 15);
    this.loadJogos();
  }

  private loadJogos() {
    console.log("ListaJogosComponent - loadJogos - equipa:", this.tmpEquipa?.id);
    if (this.tmpEquipa && this.tmpEquipa.id !== undefined) {
      this.jogoService.getAllJogosByEquipa(this.tmpEquipa.id).subscribe({
        next: (data) => {
          console.log('ListaJogosComponent | getAllJogosByEquipa | data:', data);
          this.jogos = data;
        },
        error: (error) => {
          console.error('Error fetching games:', error);
        }
      });
    } else {
      console.warn('tmpEquipa is undefined or does not have an id.');
    }
  }


  adicionarJjogo() {
    // Lógica para adicionar um novo jogo
    const novoJogo: JogoData = {
      id: 0,
      data: new Date(),
      equipa_adv_id: 1,
      equipa_adv_nome: 'teste',
      golos_equipa: 0,
      golos_equipa_adv: 0,
      estado: 'REGISTADO',
      tipo_local: 'Casa',
      competicao_id: 1,
      competicao_nome: 'Distrital APP',
      epoca_id: 0,
      equipa_id: 0,
      tipoEquipa: '',
      hora: '',
      local: '',
      tipoEquipa_adv: '',
      arbitro_1: 0,
      arbitro_2: 0
    };

    this.jogos.push(novoJogo);

  }
}
