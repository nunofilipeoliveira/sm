import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule para *ngIf

import { LoginServiceService } from '../../services/login-service.service';
import { EquipaService } from '../../services/equipa.service';
import { UtilizadorData } from './UtilizadorData';
import { UtilizadorParaAtivarData } from './UtilizadorParaAtivarData';


// Adicione esta interface se não existir em outro lugar
interface EscalaoData {
  id: number;
  escalaoDescritivo: string;
}

interface EscalaoDataApresentacao {
  id: number;
  escalaoDescritivo: string;
  check: boolean;
}



@Component({
  selector: 'app-gestaoutilizador',
  templateUrl: './gestaoutilizador.component.html',
  styleUrls: ['./gestaoutilizador.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule] // Adicionar CommonModule aqui
})
export class GestaoutilizadorComponent implements OnInit {

  mostrarModal: boolean = false; // Controlar a visibilidade do modal
  modalTitulo: string = 'Editar Utilizador'; // Título do modal
  modoNovoUtilizador: boolean = false; // Controlar se estamos a criar um novo utilizador
  // Não precisamos de 'utilizadorEditando' separado, pois editaremos 'utilizador' diretamente
  iduser: number = 0;

  // Modelo para o utilizador carregado e para o formulário do modal
  utilizador: UtilizadorData = {
    id: 0,
    nome: '',
    email: '',
    perfil: 'Utilizador',
    user: '',
    estado: ''
  };

  // Objeto temporário para o formulário do modal (para não alterar o 'utilizador' diretamente antes de salvar)
  novoUtilizador: UtilizadorData = {
    id: 0,
    nome: '',
    email: '',
    perfil: 'Utilizador',
    user: '',
    estado: ''
  };

  escaloesEpocaAtual: EscalaoData[] = [];
  escaloesUtilizador: EscalaoData[] = [];
  escaloesApresentacao: EscalaoDataApresentacao[] = [];
  userJaExiste: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loginws: LoginServiceService,
    private equipaService: EquipaService
  ) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.iduser = Number(routeParams.get('idUtilizador'));



    if (this.iduser && this.iduser > 0) {
      this.carregarUtilizador(this.iduser);
    } else {
      this.modoNovoUtilizador = true;
      this.mostrarModal = true;
      this.modalTitulo = 'Novo Utilizador';
      this.novoUtilizador.perfil = 'UTILIZADOR';

      //carrega escaloes da epoca
      this.equipaService.getAllEscaloes().subscribe({
        next: (escaloes: EscalaoData[]) => {
          console.log('Escalões da época atual carregados:', escaloes);
          this.escaloesEpocaAtual = escaloes;

          //carregamento dos escaloes a apresentar
          for (let i = 0; i < this.escaloesEpocaAtual.length; i++) {
            if (this.escaloesUtilizador.find(e => e.id === this.escaloesEpocaAtual[i].id)) {
              this.escaloesApresentacao.push({
                id: this.escaloesEpocaAtual[i].id,
                escalaoDescritivo: this.escaloesEpocaAtual[i].escalaoDescritivo,
                check: true
              });
            } else {
              this.escaloesApresentacao.push({
                id: this.escaloesEpocaAtual[i].id,
                escalaoDescritivo: this.escaloesEpocaAtual[i].escalaoDescritivo,
                check: false
              });
            }

          }

        },
        error: (err) => {
          console.error('Erro ao carregar escaloes da época atual:', err);
          // Tratar erro, talvez redirecionar ou mostrar mensagem
          this.escaloesEpocaAtual = []; // Resetar para estado inicial em caso de erro
        }
      });

    }





  }

  carregarUtilizador(id: number): void {
    this.loginws.getUser(id).subscribe({
      next: (user: UtilizadorData) => {
        console.log('Utilizador carregado:', user);
        this.utilizador = user;

        //carrega escales do user:
        this.loginws.getEscaloesByUser(id).subscribe({
          next: (escaloes: EscalaoData[]) => {
            console.log('Escalões do utilizador carregados:', escaloes);
            this.escaloesUtilizador = escaloes;

            //carrega escaloes da epoca
            this.equipaService.getAllEscaloes().subscribe({
              next: (escaloes: EscalaoData[]) => {
                console.log('Escalões da época atual carregados:', escaloes);
                this.escaloesEpocaAtual = escaloes;

                //carregamento dos escaloes a apresentar
                for (let i = 0; i < this.escaloesEpocaAtual.length; i++) {
                  if (this.escaloesUtilizador.find(e => e.id === this.escaloesEpocaAtual[i].id)) {
                    this.escaloesApresentacao.push({
                      id: this.escaloesEpocaAtual[i].id,
                      escalaoDescritivo: this.escaloesEpocaAtual[i].escalaoDescritivo,
                      check: true
                    });
                  } else {
                    this.escaloesApresentacao.push({
                      id: this.escaloesEpocaAtual[i].id,
                      escalaoDescritivo: this.escaloesEpocaAtual[i].escalaoDescritivo,
                      check: false
                    });
                  }

                }

                console.log('Escalões para apresentação:', this.escaloesApresentacao);


              },
              error: (err) => {
                console.error('Erro ao carregar escaloes da época atual:', err);
                // Tratar erro, talvez redirecionar ou mostrar mensagem
                this.escaloesEpocaAtual = []; // Resetar para estado inicial em caso de erro
              }
            });

          },
          error: (err) => {
            console.error('Erro ao carregar escaloes do utilizador:', err);
            // Tratar erro, talvez redirecionar ou mostrar mensagem
            this.escaloesUtilizador = []; // Resetar para estado inicial em caso de erro
          }
        });

      },
      error: (err) => {
        console.error('Erro ao carregar utilizador:', err);
        // Tratar erro, talvez redirecionar ou mostrar mensagem
        this.utilizador = { // Resetar para estado inicial em caso de erro
          id: 0,
          nome: '',
          email: '',
          perfil: 'Utilizador',
          user: '',
          estado: ''
        };
      }
    });




  }

  abrirEditarUtilizador(): void {
    // Copia os dados do utilizador atual para o objeto do modal
    this.novoUtilizador = { ...this.utilizador };
    this.modalTitulo = 'Editar Utilizador';
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
  }

  cancelarModal(): void {
    this.fecharModal();
    this.router.navigate(['/administracao']);
  }

  salvarUtilizador(): void {

    // Simulação de sucesso:
    this.utilizador = { ...this.novoUtilizador }; // Atualiza o utilizador exibido

    this.loginws.updateUserWithEscaloes(this.utilizador.id, this.escaloesApresentacao.filter(e => e.check).map(e => e.id)).subscribe({
      next: (response) => {
        console.log('Utilizador atualizado com sucesso:', response);
        this.utilizador = { ...this.novoUtilizador }; // Atualiza o utilizador exibido
        this.fecharModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar utilizador:', err);
        // Tratar erro
      }
    });

    this.loginws.updateUser(this.utilizador.id, this.utilizador).subscribe({
      next: (response) => {
        console.log('Utilizador atualizado com sucesso:', response);
        this.utilizador = { ...this.novoUtilizador }; // Atualiza o utilizador exibido
        this.fecharModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar utilizador:', err);
        // Tratar erro
      }
    });

    console.log('Utilizador salvo:', this.utilizador);
  }

  desativarUtilizador(): void {
    if (confirm(`Tem certeza que deseja desativar o utilizador ${this.utilizador.nome}?`)) {
      // Chamar serviço para desativar
      // Ex: this.loginws.desativarUser(this.utilizador.id).subscribe(...)
      this.utilizador.estado = '0'; // Simulação
      console.log(`Utilizador ${this.utilizador.nome} desativado.`);
    }
  }

  ativarUtilizador(): void {
    if (confirm(`Tem certeza que deseja ativar o utilizador ${this.utilizador.nome}?`)) {
      // Chamar serviço para ativar
      // Ex: this.loginws.ativarUser(this.utilizador.id).subscribe(...)
      this.utilizador.estado = '1'; // Simulação
      console.log(`Utilizador ${this.utilizador.nome} ativado.`);
    }
  }
  voltar(): void {
    this.router.navigate(['/administracao']);
  }


  removerEspacos(value: string): string {
  return value.replace(/\s/g, '');
}

  criarUtilizador(): void {
    let utilizadorParaCriar: UtilizadorParaAtivarData = {
    
      nome: this.novoUtilizador.nome,
      user: this.novoUtilizador.user,
      email: this.novoUtilizador.email,
      perfil: this.novoUtilizador.perfil,
      estado: '1',
      code:'',
      idsescalao: this.escaloesApresentacao.filter(e => e.check).map(e => e.id).join(';')
    };


    //verifica se o user já existe
    
    let tmpUser:UtilizadorData;
    this.loginws.getUserbyUserName(this.novoUtilizador.user).subscribe({
      next: (user) => {
        console.log('Utilizador encontrado:', user);
        tmpUser = user;
        // Se o utilizador já existe, pode-se optar por atualizar ou mostrar uma mensagem
        this.userJaExiste = true;
        console.log('User já existe', this.userJaExiste);
      },
      error: (err) => {
        console.error('Erro ao verificar utilizador:', err);
        // Se não existe, pode-se prosseguir com a criação
        this.loginws.createUserToAtivate(utilizadorParaCriar).subscribe({
          next: (response) => {
            console.log('Utilizador criado com sucesso:', response);
            this.router.navigate(['/administracao']);
          },
          error: (err) => {
            console.error('Erro ao criar utilizador:', err);
            // Tratar erro
          }
        });
      }
    });
  }


}
