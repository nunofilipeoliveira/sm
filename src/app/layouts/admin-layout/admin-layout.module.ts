import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FichaJogadorComponent } from '../../pages/fichaJogador/fichaJogador.component';
import { GestaoEquipaComponent } from '../../pages/gestao-equipa/gestao-equipa.component'; // Adicione esta linha
import { AdministracaoComponent } from '../../pages/administracao/administracao.component';
import { ListaJogosComponent } from '../../pages/lista-jogos/lista-jogos.component';
import { ConvocatoriaComponent } from '../../pages/convocatoria/convocatoria.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    MatIconModule,
    FichaJogadorComponent,
    GestaoEquipaComponent, // Adicione esta linha
    AdministracaoComponent, // Adicione esta linha
    ListaJogosComponent,
    ConvocatoriaComponent
  ],
  declarations: [ ]
})

export class AdminLayoutModule {}
