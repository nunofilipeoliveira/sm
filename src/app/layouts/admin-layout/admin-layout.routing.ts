import { FichaJogadorComponent } from './../../pages/fichaJogador/fichaJogador.component';
import { Routes } from '@angular/router';
import { EquipaComponent } from '../../pages/equipa/equipa.component';
import { Marcar_presencaComponent } from '../../pages/marcar_presenca/marcar_presenca.component';
import { PresencasComponent } from '../../pages/presencas/presencas.component';
import { PresencaComponent } from '../../pages/presenca/presenca.component';
import { JogadorSeleccaoComponent } from '../../pages/jogador-seleccao/jogador-seleccao.component';
import { FichaStaffComponent } from '../../pages/ficha-staff/ficha-staff.component';
import { HistoricoLoginsComponent } from '../../pages/historico-logins/historico-logins.component';
import { ListaJogosComponent } from '../../pages/lista-jogos/lista-jogos.component';
import { JogoComponent } from '../../pages/jogo/jogo.component';

export const AdminLayoutRoutes: Routes = [
  { path: 'equipa', component: EquipaComponent },
  { path: 'fichaJogador/:id', component: FichaJogadorComponent },
  { path: 'fichaStaff/:id', component: FichaStaffComponent },
  { path: 'mpresenca', component: Marcar_presencaComponent },
  { path: 'mpresenca/:id', component: Marcar_presencaComponent },
  { path: 'presencas', component: PresencasComponent },
  { path: 'presenca/:id', component: PresencaComponent },
  { path: 'jogadorSeleccao/:id', component: JogadorSeleccaoComponent },
  { path: 'historicologins', component: HistoricoLoginsComponent },
  { path: 'listajogos', component:ListaJogosComponent},
  { path: 'jogo/:id', component: JogoComponent },
];
