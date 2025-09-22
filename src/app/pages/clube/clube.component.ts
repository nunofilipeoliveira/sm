import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClubeData } from '../gestao-clubes/clubesData';
import { FormsModule } from '@angular/forms';
import { ClubeService } from '../../services/clube.service';
import { FicheirosService } from '../../services/ficheiros.service';

@Component({
  selector: 'clube',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clube.component.html',
  styleUrl: './clube.component.css'
})
export class ClubeComponent {

  isEditing: boolean = false;
    logoUrl: string = '';
    isUploadLogo: boolean = false;
    isNovoClube: boolean = false;

 @Input() clube!: ClubeData; // <-- Recebe os dados do clube via Input (passado do componente principal)
  constructor(public activeModal: NgbActiveModal, private clubeService: ClubeService, private ficheirosService: FicheirosService) { 


  }

  ngOnInit() {
    this.loadImages(this.clube.id);
    if(this.clube.id === 0) {
      this.isNovoClube = true;
      this.isEditing = true;
    }
  } 

  // Método opcional para fechar o modal
  fechar(): void {
    this.activeModal.close();
  }
  // Método opcional para editar (exemplo; implemente conforme necessário)
  editarClube(): void {
    this.activeModal.close();
    // Exemplo: window.location.href = `/editarClube/${this.clube.id}`;
    console.log('Editar clube:', this.clube.id);
  }

  startEditing() {
    this.isEditing = true;
  }

  gravar() {
    this.isEditing = false;
    // Aqui você pode adicionar a lógica para salvar as alterações, se necessário
    console.log('Gravar alterações para o clube:', this.clube);
    this.clubeService.updateClube(this.clube).subscribe({
      next: (data) => {
        console.log('Clube atualizado com sucesso:', data);
        if(this.isNovoClube) {
          this.fechar();
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar clube:', error);
        alert('Erro ao atualizar clube. Por favor, tente novamente.');
      }
    });
  }

  cancelar() {
    this.isEditing = false;
      this.isUploadLogo = false;
    // Aqui você pode adicionar a lógica para reverter as alterações, se necessário
    console.log('Cancelar edição para o clube:', this.clube);
  }

  carregar_logotipo() {
    this.isUploadLogo = true;
    console.log('Carregar logotipo para o clube:', this.clube);
    // Aqui você pode adicionar a lógica para carregar o logotipo, se necessário
  }

  loadImages(idClube: number) {
    const timestamp = new Date().getTime();
    console.log('Carregando imagem para o clube ID:', idClube);
    this.logoUrl = `assets/img/clubes/clube_${idClube}.png?v=${timestamp}`;
    console.log('URL da imagem carregada:', this.logoUrl);
  }


  onFileSelected(event: any) {
    console.log("onFileSelected | File selected:", event);
    console.log("onFileSelected | Selected file:", event.target.files[0]);
    this.isUploadLogo = false;
    let file: File = event.target.files[0];

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('Ficheiro demasiado grande. Máximo 10MB.');
      return;
    }


    let formDate = new FormData();
    formDate.append('foto', file);
    let nomefoto = "";
    
      nomefoto = ("clube_"+this.clube.id);
    
    console.log("onFileSelected | Nome foto:", nomefoto);
   
    this.ficheirosService.uploadLogoClube({ parmIdLogo : nomefoto, foto: formDate }).subscribe(resp => {
      console.log("onFileSelected | Upload response:", resp);
      const timestamp = new Date().getTime();

        this.logoUrl = `assets/img/clubes/clube_${this.clube.id}.png?v=${timestamp}`;
        console.log("onFileSelected | Updated logoUrl:", this.logoUrl);

     
     


    })

    this.isUploadLogo = false;
  
    this.isEditing = false;

  }


}
