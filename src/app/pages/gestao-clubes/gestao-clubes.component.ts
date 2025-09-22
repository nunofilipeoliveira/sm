// src/app/pages/gestao-clubes/gestao-clubes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClubeData } from './clubesData';
import { ClubeService } from '../../services/clube.service';
import { ClubeComponent } from '../clube/clube.component';

@Component({
  selector: 'app-gestao-clubes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestao-clubes.component.html',
  styleUrls: ['./gestao-clubes.component.css']
})
export class GestaoClubesComponent implements OnInit {



  clubes: ClubeData[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  

  constructor(
    private router: Router,
    private modalService: NgbModal, private clubeService: ClubeService
  ) { }

  ngOnInit(): void {
    this.carregarClubes();
    
  }

  carregarClubes(): void {
    this.loading = true;
    this.errorMessage = null;


    this.clubeService.getAllClubes().subscribe({
      next: (data: ClubeData[]) => {
        this.clubes = data;
        this.loading = false;
        if (this.clubes.length === 0) {
          this.errorMessage = 'Nenhum clube encontrado.';
        }
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
        console.error('Erro ao carregar clubes:', error);
      }
    });

  }

  verDetalhesClube(clube: ClubeData): void { // <-- Agora recebe explicitamente ClubeData (corrige o erro de tipo)
    const modalRef = this.modalService.open(ClubeComponent); // <-- Abre o novo componente modal
    modalRef.componentInstance.clube = clube; // <-- Agora funciona, pois é um componente real
  }

  adicionarNovoClube(): void {
    console.log('Adicionar novo clube');
    const novoClube: ClubeData = {
      id: 0,
      nome: 'Novo Clube',
      pav_nome: '',
      pav_endereco: '',
      pav_link: ''
    };
    const modalRef = this.modalService.open(ClubeComponent); // <-- Abre o novo componente modal
    modalRef.componentInstance.clube = novoClube; // <-- Agora funciona, pois é um componente real

    modalRef.closed.subscribe(() => {
      this.carregarClubes(); // Recarrega a lista de clubes após fechar o modal
    });
  }
}
