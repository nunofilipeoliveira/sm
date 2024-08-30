import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { Marcar_presencaComponent }           from '../../pages/marcar_presenca/marcar_presenca.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FichaJogadorComponent } from '../../pages/fichaJogador/fichaJogador.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    MatIconModule,
    Marcar_presencaComponent,
    FichaJogadorComponent,
    CommonModule
  ],
  declarations: [ ]
})

export class AdminLayoutModule {}
