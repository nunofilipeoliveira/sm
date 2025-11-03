import { Component, model, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
export class PoppupMotivoComponent implements OnInit {

  @Input() motivoInicial: string = '';
  public motivoTexto: string = '';
  public saiu_ok: boolean = false;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.motivoTexto = this.motivoInicial;
  }


  doLogin() {
    console.log("Caixa motivo", this.motivoTexto);
    this.saiu_ok = true;
    this.activeModal.close(this.motivoTexto);

  }

  ngOnDestroy(): void {
    if (this.saiu_ok == false) {
      this.motivoTexto = '';
    }
    this.activeModal.close(this.motivoTexto);
  }

  keepFocus(el: HTMLTextAreaElement) {

    setTimeout(() => {
    el.focus();
  }, 100);


}


}
