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
import { AuthGuard } from '../../guard/auth.guard'; // Certifique-se que o caminho está correto

export const AdminLayoutRoutes: Routes = [
  { path: 'equipa', component: EquipaComponent, canActivate: [AuthGuard] },
  { path: 'fichaJogador/:id', component: FichaJogadorComponent, canActivate: [AuthGuard] },
  { path: 'fichaStaff/:id', component: FichaStaffComponent, canActivate: [AuthGuard] },
  { path: 'mpresenca', component: Marcar_presencaComponent, canActivate: [AuthGuard] },
  { path: 'mpresenca/:id', component: Marcar_presencaComponent, canActivate: [AuthGuard] },
  { path: 'presencas', component: PresencasComponent, canActivate: [AuthGuard] },
  { path: 'presenca/:id', component: PresencaComponent, canActivate: [AuthGuard] },
  { path: 'jogadorSeleccao/:id', component: JogadorSeleccaoComponent, canActivate: [AuthGuard] },
  { path: 'historicologins', component: HistoricoLoginsComponent, canActivate: [AuthGuard] },
  { path: 'listajogos', component:ListaJogosComponent, canActivate: [AuthGuard]},
  { path: 'jogo/:id', component: JogoComponent, canActivate: [AuthGuard] },
];
