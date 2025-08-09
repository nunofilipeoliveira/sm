import { PresencaService } from './../../services/presenca.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipaService } from '../../services/equipa.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroStaffPipe } from './filtroStaff.pipe';


@Component({
  selector: 'staff-seleccao',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroStaffPipe],
  templateUrl: './staff-seleccao.component.html',
  styleUrl: './staff-seleccao.component.css'
})
export class StaffSeleccaoComponent implements OnInit {

  public spinner: boolean = false;
  public idEscalao: number = 0;
  public staffs: staffSeleccao[] = [];
  public filtro_nome: string = "";
  public filtro_visivel: boolean = false;
  public origem_gestao_equipa: boolean = false;

  constructor(private route: ActivatedRoute, private equipaService: EquipaService, private presencaService: PresencaService, private router: Router) { }

  ngOnInit() {
    this.spinner = true;
    const routeParams = this.route.snapshot.paramMap;
    this.idEscalao = Number(routeParams.get('id'));
    let nomeStaff = String(routeParams.get('nomeStaff'));
    console.log('StaffSeleccaoComponent | idEscalao:', this.idEscalao);
    console.log('StaffSeleccaoComponent | nomeStaff:', nomeStaff);
    if(nomeStaff!="null") {
      console.log("StaffSeleccaoComponent | Modo nomeStaff");
      this.filtro_nome = nomeStaff
        }

    console.log('StaffSeleccaoComponent | idEscalao:', this.idEscalao);
    if (this.idEscalao < 0) {
      console.log("StaffSeleccaoComponent | Modo seleção staff genérico");
      this.origem_gestao_equipa = true;
      this.idEscalao = this.idEscalao * -1;
    } else {
      console.log("StaffSeleccaoComponent | Modo seleção staff origem marcação presença");
      this.origem_gestao_equipa = false;
    }

    this.equipaService.getAllStaffDisponivel(this.idEscalao).subscribe(
      {
        next: data => {
         // this.staffs = data.map((staff: staffSeleccao) => ({
         //   ...staff,
         //   tipoSelecionado: null // Inicializa o tipoSelecionado como null para cada staff
        //  }));
         
        this.staffs = data
     
        
          
        console.log("StaffSeleccaoComponent | staffs disponiveis", this.staffs);
          this.spinner = false;
          if (data != null) {
            // Data is already mapped above

            console.log('StaffSeleccaoComponent | ngOnInit | staffs:', this.staffs );

          } else {
            // Handle null data if necessary
          }
        },
        error: error => {
          console.log("StaffSeleccaoComponent | Serviço gravarFichaJogador Erro!!", error);
        }
      });


      


      
  }

  seleciona(id_staff: number, tipoSelecionado: string | null) {
    console.log("StaffSeleccaoComponent | Seleciona");
    console.log("StaffSeleccaoComponent | Seleciona | staffs:", this.staffs);
    console.log("StaffSeleccaoComponent | Seleciona | id_staff:", id_staff);
    console.log("StaffSeleccaoComponent | Seleciona | tipoSelecionado:", tipoSelecionado);

    if (!tipoSelecionado) {
      alert('Por favor, selecione um tipo para o staff.');
      return; // Impede a continuação se nenhum tipo for selecionado
    }

    if (this.origem_gestao_equipa) {
      console.log("Modo seleção staff genérico");

      let posicao = this.staffs.findIndex(x => x.id_Jogador === id_staff);
      if (posicao === -1) {
        console.error('Staff não encontrado na lista:', id_staff);
        return;
      }

      let tmpStaff: staffData = {
        id: this.staffs[posicao].id_Jogador,
        nome: this.staffs[posicao].nome_Jogador,
        nome_completo: '',
        data_nascimento: 0,
        email: '',
        telemovel: '',
        morada: '',
        codigo_postal: '',
        id_jogador: 0,
        tipo: tipoSelecionado // Usa o valor selecionado da combobox
      };

      this.spinner = true;
      this.equipaService.addStaffEquipa(tmpStaff).subscribe({
        next: (response) => {
          console.log('Staff adicionado com sucesso:', response);
          // Atualiza a lista localmente após adicionar
          this.equipaService.getEquipa().staff.push(tmpStaff);
          this.router.navigate(['/gestao-equipa']);
          this.spinner = false;
        },
        error: (error) => {
          console.error('Erro ao adicionar staff à equipa:', error);
          alert('Ocorreu um erro ao adicionar o staff à equipa');
          this.router.navigate(['/gestao-equipa']);
          this.spinner = false;
        }
      });

    } else {
      
    }
  }



  cancelarSelecao() {
    console.log("StaffSeleccaoComponent | Cancelar seleção");
    if (this.origem_gestao_equipa) {
      this.router.navigate(['/gestao-equipa']);
    } else {
      this.router.navigate(['/mpresenca']);
    }
  }

  novoStaff() {
    console.log("StaffSeleccaoComponent | Novo Staff");
    
      this.router.navigate(['/novo-staff/staffSeleccao/-'+this.idEscalao]);
  }

}
