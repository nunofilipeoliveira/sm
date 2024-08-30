import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';






@Component({
  selector: 'poppup-escalao',
  standalone: true,
  imports: [ FormsModule, CommonModule],
  templateUrl: './poppup-escalao.component.html',
  styleUrl: './poppup-escalao.component.css'
})
export class PoppupEscalaoComponent implements OnInit {

  escalaoEscolhido:number=0;
  escaloes: any[]|undefined;

  constructor(private router: Router, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: escalao_epoca[]) { }

  ngOnInit(): void {

    this.escaloes=this.data;
    this.escalaoEscolhido=this.escaloes[0].id_escalao_epoca;

  }

  doLogin() {



    localStorage.setItem('idequipa_escalao', this.escalaoEscolhido.toString());


    for (let i = 0; i < this.escaloes!.length; i++) {
      if(this.escaloes![i].id_escalao_epoca==this.escalaoEscolhido)
        localStorage.setItem('descritivo_escalao', this.escaloes![i].descritivo_escalao);

    }

    this.dialog.closeAll();
    this.router.navigate(['/equipa']);
  }
}


interface escalao_epoca {
  id_escalao_epoca: number;
  descritivo_escalao: string;
}
