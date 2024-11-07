import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'lista-jogos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './lista-jogos.component.html',
  styleUrl: './lista-jogos.component.css'
})
export class ListaJogosComponent {
  constructor(private router: Router){}
  games = [
    {
      result: 'V', // Vitória
      local: 'F',
      date: '2024-10-06',
      time: '20:30',
      opponent: 'Bragança',
      score: '2-7',
      competition: 'Distrital 24/25 - Série A',
      flag: 'assets/img/competicoes/app.png', // substituir pelo caminho correto
      opponentLogo: 'assets/img/equipas/cab.png' // substituir pelo caminho correto
    },
    {
      result: 'E', // Empate
      local: 'C',
      date: '2024-10-03',
      time: '20:00',
      opponent: 'Infante Sagres',
      score: '3-3',
      competition: 'Distrital 24/25 - Série C',
      flag: 'assets/img/competicoes/app.png', // substituir pelo caminho correto
      opponentLogo: 'assets/img/equipas/cis.png' // substituir pelo caminho correto
    },
    // Adicionar mais jogos aqui seguindo o padrão acima
  ];

  verJogo(parmId: number) {
    this.router.navigate(['jogo/', parmId]);
  }
}
