import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';

import {

  MatDialogRef,

} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'poppup-motivo.component.html',
  styleUrl: 'poppup-motivo.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PoppupMotivoComponent {

  public motivoTexto: string = '';
  public saiu_ok: boolean = false;
  constructor(private dialog: MatDialogRef<string>) { }


  doLogin() {
    console.log("Caixa motivo", this.motivoTexto);
    this.saiu_ok = true;
    this.dialog.close(this.motivoTexto);

  }

  ngOnDestroy(): void {
    if (this.saiu_ok == false) {
      this.motivoTexto = '';
    }
    this.dialog.close(this.motivoTexto);
  }

  keepFocus(el: HTMLTextAreaElement) {

    setTimeout(() => {
    el.focus();
  }, 100);


}


}
