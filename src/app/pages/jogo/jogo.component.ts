import { Component, OnInit } from "@angular/core";

export interface Player {
  number: number;
  name: string;
  minute?: string;  // Para os momentos importantes (ex: golos, cartões)
}

export interface Team {
  name: string;
  logo: string;
  players: Player[];
}

export interface Game {
  homeTeam: Team;
  awayTeam: Team;
  score: { home: number; away: number };
  goals: { minute: string; player: string }[];
  date: string;
  stadium: string;
}

@Component({
  selector: 'jogo',
  standalone: true,
  imports: [],
  templateUrl: './jogo.component.html',
  styleUrl: './jogo.component.css'
})

export class JogoComponent implements OnInit {
  game!: Game;

  ngOnInit() {
    this.game = {
      homeTeam: {
        name: 'Gil Vicente',
        logo: 'assets/images/gil-vicente-logo.png',
        players: [
          { number: 42, name: 'Andrew Ventura' },
          { number: 2, name: 'Zé Carlos', minute: '90+2' },
          { number: 26, name: 'Rúben Fernandes (C)' },
          { number: 39, name: 'Jonathan Buatu' },
          { number: 57, name: 'Sandro Cruz' },
          { number: 6, name: 'Jesús Castillo' },
          { number: 10, name: 'Kanya Fujimoto', minute: '⚽ 33\'' },
          { number: 19, name: 'Santi García', minute: '56\'' },
          { number: 77, name: 'Jordi Mboula', minute: '9\'' },
          { number: 20, name: 'Cauê dos Santos', minute: '69\'' },
          { number: 71, name: 'Félix Correia', minute: '⚽ 9\' 90+2\'' }
        ]
      },
      awayTeam: {
        name: 'Est. Amadora',
        logo: 'assets/images/amadora-logo.png',
        players: []
      },
      score: { home: 3, away: 0 },
      goals: [
        { minute: '9\'', player: 'Félix Correia' },
        { minute: '33\'', player: 'Kanya Fujimoto' },
        { minute: '82\'', player: 'Jorge Aguirre' }
      ],
      date: 'Sábado 5 Outubro 2024 - 15h30',
      stadium: 'Estádio Cidade de Barcelos'
    };
  }
}




