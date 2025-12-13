import { FichaJogadorComponent } from './../../pages/fichaJogador/fichaJogador.component';
import { Routes } from '@angular/router';
import { EquipaComponent } from '../../pages/equipa/equipa.component';
import { Marcar_presencaComponent } from '../../pages/marcar_presenca/marcar_presenca.component';
import { PresencasComponent } from '../../pages/presencas/presencas.component';
import { PresencaComponent } from '../../pages/presenca/presenca.component';
import { FichaStaffComponent } from '../../pages/ficha-staff/ficha-staff.component';
import { HistoricoLoginsComponent } from '../../pages/historico-logins/historico-logins.component';
import { ListaJogosComponent } from '../../pages/lista-jogos/lista-jogos.component';
import { JogoComponent } from '../../pages/jogo/jogo.component';
import { AuthGuard } from '../../guard/auth.guard'; // Certifique-se que o caminho está correto
import { GestaoEquipaComponent } from '../../pages/gestao-equipa/gestao-equipa.component'; // Adicione esta linha
import { StaffSeleccaoComponent } from '../../pages/staff-seleccao/staff-seleccao.component';
import { NovoStaffComponent } from '../../pages/novo-staff/novo-staff.component';
import { NovoJogadorComponent } from '../../pages/novo-jogador/novo-jogador.component';
import { AdministracaoComponent } from '../../pages/administracao/administracao.component';
import { GestaoutilizadorComponent } from '../../pages/gestaoutilizador/gestaoutilizador.component';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { GestaoClubesComponent } from '../../pages/gestao-clubes/gestao-clubes.component';
import { ConvocatoriaComponent } from '../../pages/convocatoria/convocatoria.component';
import { EstatisticasComponent } from '../../pages/estatisticas/estatisticas.component';

export const AdminLayoutRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }, // Nova rota para o dashboard
  { path: 'equipa', component: EquipaComponent, canActivate: [AuthGuard] },
  { path: 'fichaJogador/:id', component: FichaJogadorComponent, canActivate: [AuthGuard] },
  { path: 'fichaStaff/:id', component: FichaStaffComponent, canActivate: [AuthGuard] },
  { path: 'mpresenca', component: Marcar_presencaComponent, canActivate: [AuthGuard] },
  { path: 'mpresenca/:id', component: Marcar_presencaComponent, canActivate: [AuthGuard] },
  { path: 'presencas', component: PresencasComponent, canActivate: [AuthGuard] },
  { path: 'presenca/:id', component: PresencaComponent, canActivate: [AuthGuard] },
  { path: 'staffSeleccao/:id', component: StaffSeleccaoComponent, canActivate: [AuthGuard] },
  { path: 'historicologins', component: HistoricoLoginsComponent, canActivate: [AuthGuard] },
  { path: 'listajogos', component: ListaJogosComponent, canActivate: [AuthGuard] },
  { path: 'jogo/:id', component: JogoComponent, canActivate: [AuthGuard] },
  { path: 'gestao-equipa', component: GestaoEquipaComponent, canActivate: [AuthGuard] }, // Nova rota
  { path: 'gestao-equipa/:idEquipa', component: GestaoEquipaComponent, canActivate: [AuthGuard] }, // Nova rota
  { path: 'novo-staff/:origem/:idEquipa', component: NovoStaffComponent, canActivate: [AuthGuard] },
  { path: 'novo-jogador/:origem/:idEquipa', component: NovoJogadorComponent, canActivate: [AuthGuard] },
  { path: 'staffSeleccao/:id/:nomeStaff', component: StaffSeleccaoComponent, canActivate: [AuthGuard] },
  { path: 'administracao', component: AdministracaoComponent, canActivate: [AuthGuard] }, // Nova rota para administração
  { path: 'gestao-utilizador/:idUtilizador', component: GestaoutilizadorComponent, canActivate: [AuthGuard] },
  { path: 'gestao-clubes', component: GestaoClubesComponent, canActivate: [AuthGuard] },
  { path: 'convocatoria/:id', component: ConvocatoriaComponent, canActivate: [AuthGuard] },
  { path: 'estatisticas', component: EstatisticasComponent, canActivate: [AuthGuard] },

];
