import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SidebarModule } from '../../sidebar/sidebar.module';
import { NavbarModule} from '../../shared/navbar/navbar.module';
import { FooterModule } from '../../shared/footer/footer.module';
import { AdminLayoutComponent } from './admin-layout.component';
import { FichaJogadorComponent } from '../../pages/fichaJogador/fichaJogador.component';
import { GestaoEquipaComponent } from '../../pages/gestao-equipa/gestao-equipa.component';
import { AdministracaoComponent } from '../../pages/administracao/administracao.component';
import { ListaJogosComponent } from '../../pages/lista-jogos/lista-jogos.component';
import { ConvocatoriaComponent } from '../../pages/convocatoria/convocatoria.component';
import { EstatisticasComponent } from '../../pages/estatisticas/estatisticas.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    MatIconModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
    FichaJogadorComponent,
    GestaoEquipaComponent,
    AdministracaoComponent,
    ListaJogosComponent,
    ConvocatoriaComponent,
    EstatisticasComponent
  ],
  declarations: [
    AdminLayoutComponent
  ]
})

export class AdminLayoutModule {}
