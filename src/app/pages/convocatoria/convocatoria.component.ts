import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipaService } from '../../services/equipa.service';
import { JogoService } from '../../services/jogo.service';
import { NgbAlertModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import html2canvas from 'html2canvas'; // Import da html2canvas




@Component({
  selector: 'app-convocatoria',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbAlertModule, NgbCollapseModule],
  templateUrl: './convocatoria.component.html',
  styleUrls: ['./convocatoria.component.css']
})
export class ConvocatoriaComponent implements OnInit {
  idJogo: number = 0;
  jogo: JogoData | undefined;
  atletasDisponiveis: ConvocatoriaData[] = [];
  equipaAtual: EquipaData | undefined;
  loading: boolean = true;
  errorMessage: string | null = null;
  sbmSuccess: boolean = false;
  sbmError: boolean = false;
  meuClubeid: number = environment.clube_id
  isModoVisualizacao: boolean = false; // Novo flag para modo de visualização
  today = new Date();
  horaConcentracao: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipaService: EquipaService,
    private jogoService: JogoService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    const routeParams = this.route.snapshot.paramMap;
    this.idJogo = Number(routeParams.get('id'));

    if (this.idJogo) {

      //verifica se tem a convocatoria na sessão
      const convocatoriaSessao = localStorage.getItem("convocatoria_jogo");
      if (convocatoriaSessao != undefined && convocatoriaSessao != null) {
        this.atletasDisponiveis = JSON.parse(convocatoriaSessao);
        console.log('Convocatória | Convocatória carregada da sessão:', this.atletasDisponiveis);
        this.loading = false;
        localStorage.removeItem("convocatoria_jogo");
      } else {
        this.carregarConvocatoria();
      }
      this.carregarDetalhesJogo(this.idJogo);
    } else {
      this.errorMessage = 'ID do jogo não fornecido.';
      this.loading = false;
    }
  }

  carregarConvocatoria(): void {
    // Lógica para carregar a convocatória existente, se necessário
    this.atletasDisponiveis = []; // Limpa a lista antes de carregar
    this.jogoService.getConvocatoriaByJogoId(this.idJogo).subscribe({
      next: (data: ConvocatoriaDataWS) => {
        console.log('Convocatória | Convocatória carregada:', data);
        if (!data || !data.jogadoresConvocados || data.jogadoresConvocados.length > 0) {
          for (let atleta of data.jogadoresConvocados) {
            this.equipaService.loadJogadorbyId(atleta).subscribe({
              next: (jogador) => {
                this.atletasDisponiveis.push({
                  id_jogador: atleta,
                  nome_jogador: jogador.nome,
                  selecionado: true
                });
              },
              error: (err) => {
                console.error('Erro ao carregar jogador:', err);
              }
            });

            this.equipaAtual = this.equipaService.getEquipa();
            this.equipaAtual = this.equipaService.getEquipa();
            if (!this.equipaAtual || this.equipaAtual.id === 0) {
              // Se a equipa não estiver carregada no serviço, tenta carregar do localStorage
              const idEquipa = localStorage.getItem("idequipa_escalao");
              if (idEquipa) {
                this.equipaService.getEquipabyIDLight(idEquipa).subscribe({
                  next: (equipa) => {
                    this.equipaAtual = equipa;
                  }
                })
              }
            }
            this.isModoVisualizacao = true;
            this.loading = false;
          }
        } else {
          this.carregarAtletasDisponiveis();
        }
        console.log('Convocatória | Atletas após carregar convocatória:', this.atletasDisponiveis);
        console.log('Convocatória | modo Visualização', this.isModoVisualizacao);
      },
      error: (err) => {
        console.error('Erro ao carregar convocatória:', err);
        this.errorMessage = 'Não foi possível carregar a convocatória.';
      }
    });
  }

  editarConvocatoria(): void {
    this.isModoVisualizacao = false;
    localStorage.setItem("jogadores_selecionados", JSON.stringify(this.atletasDisponiveis));
    this.carregarAtletasDisponiveis();
    const tmpAtletasDisponiveis = localStorage.getItem("jogadores_selecionados");
    let atletasDisponiveis_antes: ConvocatoriaData[] = tmpAtletasDisponiveis
      ? JSON.parse(tmpAtletasDisponiveis)
      : [];

    // Cria um Set só com os IDs que estavam no localStorage
    const idsSelecionados = new Set(atletasDisponiveis_antes.map(a => a.id_jogador));

    // Atualiza a lista principal, marcando o campo selecionado
    this.atletasDisponiveis = this.atletasDisponiveis.map(atleta => ({
      ...atleta,
      selecionado: idsSelecionados.has(atleta.id_jogador)
    }));

    // Adiciona os que estavam no localStorage mas não vieram da API
    // Cria um Set com os IDs da lista que veio da API
    const idsAPI = new Set(this.atletasDisponiveis.map(a => a.id_jogador));
    let extras: ConvocatoriaData[] = atletasDisponiveis_antes.filter(a => !idsAPI.has(a.id_jogador));
    this.atletasDisponiveis.push(...extras);


  }

  carregarDetalhesJogo(id: number): void {
    this.jogoService.getJogoById(id).subscribe({
      next: (data: JogoData) => {
        this.jogo = data;
        // Você pode querer carregar a convocatória existente aqui, se houver
        // Ex: this.jogoService.getConvocatoriaByJogo(id).subscribe(...)
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do jogo:', err);
        this.errorMessage = 'Não foi possível carregar os detalhes do jogo.';
      }
    });
  }

  carregarAtletasDisponiveis(): void {
    this.equipaAtual = this.equipaService.getEquipa();
    if (!this.equipaAtual || this.equipaAtual.id === 0) {
      // Se a equipa não estiver carregada no serviço, tenta carregar do localStorage
      const idEquipa = localStorage.getItem("idequipa_escalao");
      if (idEquipa) {
        this.equipaService.getEquipabyIDLight(idEquipa).subscribe({
          next: (equipa) => {
            this.equipaAtual = equipa;
            this.processarAtletas();

          },
          error: (err) => {
            console.error('Erro ao carregar equipa:', err);
            this.errorMessage = 'Não foi possível carregar a equipa.';
            this.loading = false;
          }
        });
      } else {
        this.errorMessage = 'ID da equipa não encontrado.';
        this.loading = false;
      }
    } else {
      this.processarAtletas();
    }
  }

  getConvocados(): ConvocatoriaData[] {
    return this.atletasDisponiveis.filter(atleta => atleta.selecionado);
  }

  // **Implementação do método partilharConvocatoria() - Copia como Markdown para WhatsApp**
  async partilharTexto(): Promise<void> {
    if (!this.jogo || this.atletasDisponiveis.length === 0) {
      alert('Não há convocatória para partilhar ou detalhes do jogo incompletos.');
      return;
    }

    const convocados = this.getConvocados();
    if (convocados.length === 0) {
      alert('Nenhum atleta selecionado para a convocatória.');
      return;
    }

    // Gera o texto formatado em Markdown otimizado para WhatsApp
    const textoMarkdown = this.gerarMarkdownParaWhatsApp();

    try {
      // Verifica se a API Clipboard está disponível e se é HTTPS
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textoMarkdown);
        console.log('Texto Markdown copiado para clipboard.');
      } else {
        // Fallback manual
        this.copiarFallbackManual(textoMarkdown);
      }

      // Mensagem de sucesso com dica para WhatsApp
      alert('Convocatória copiada para a área de transferência! Abra o WhatsApp, crie uma nova mensagem e cole (Ctrl+V). A formatação será aplicada automaticamente.');

      // Opcional: Abre o WhatsApp Web para facilitar (remova se não quiser)
      // window.open('https://web.whatsapp.com/', '_blank');

    } catch (error) {
      console.error('Erro ao copiar para clipboard:', error);
      this.copiarFallbackManual(textoMarkdown);
    }
  }

  // **Método auxiliar: Gera texto em Markdown otimizado para WhatsApp**
  private gerarMarkdownParaWhatsApp(): string {
    const dataJogo = this.jogo?.data ? new Date(this.jogo.data).toLocaleDateString('pt-PT') : 'Indefinida';
    const horaJogo = this.jogo?.hora || 'Indefinida';
    const localJogo = this.jogo?.local || 'Indefinido';
    const adversario = this.jogo?.equipa_adv_nome || 'Indefinido';
    const competicao = this.jogo?.competicao_nome || 'Indefinida';
    const escalao = this.equipaAtual?.escalao || 'Equipa';

    let markdown = `*Convocatória Oficial*\n\n`;
    markdown += `*Equipa:* ${escalao}\n\n`;
    markdown += `*DETALHES DO JOGO*\n`;
    markdown += `*Adversário:* ${adversario}\n`;
    markdown += `*Data:* ${dataJogo} às ${horaJogo}\n`;
    markdown += `*Local:* ${localJogo}\n`;
    markdown += `*Competição:* ${competicao}\n\n`;
    markdown += `*ATLETAS CONVOCADOS* (${this.selecionadosCount} de ${this.totalAtletas})\n`;

    if (this.selecionadosCount > 0) {
      // Lista numerada simples (WhatsApp converte para numerada)
      this.getConvocados().forEach((atleta, index) => {
        markdown += `${index + 1}. ${atleta.nome_jogador}\n`;
      });
    } else {
      markdown += `Nenhum atleta convocado.\n`;
    }

    markdown += `\n_Por favor, confirme a sua presença o mais breve possível._\n`;
    markdown += `\n*Gerado por Sports Manager* - ${this.today.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;

    return markdown;
  }

  // **Fallback manual para navegadores antigos**
  private copiarFallbackManual(texto: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Copiado (modo compatibilidade)! Cole no WhatsApp.');
      } else {
        alert('Falha ao copiar. Copie o texto abaixo manualmente:\n\n' + texto);
      }
    } catch (err) {
      console.error('Fallback falhou:', err);
      alert('Erro ao copiar. Copie este texto manualmente:\n\n' + texto);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  // **Novo método: Gera imagem PNG com avatares e baixa/compartilha**
  async gerarImagemComFotos(): Promise<void> {

    this.calcularHoraConcentracao()
    if (!this.jogo || this.atletasDisponiveis.length === 0) {
      alert('Não há convocatória para gerar imagem ou detalhes do jogo incompletos.');
      return;
    }

    const convocados = this.getConvocados();
    if (convocados.length === 0) {
      alert('Nenhum atleta selecionado para a convocatória.');
      return;
    }

    const elementoImagem = document.getElementById('convocatoria-imagem');
    if (!elementoImagem) {
      alert('Erro ao preparar imagem da convocatória.');
      return;
    }

    // Torna o div visível temporariamente
    elementoImagem.style.display = 'block';

    // Aguarda renderização (para bindings e imagens carregarem)
    await new Promise(resolve => setTimeout(resolve, 200)); // Aumentei para 200ms por causa das imagens

    try {
      // Captura com html2canvas (alta qualidade, suporte a imagens)
      const canvas = await html2canvas(elementoImagem, {
        scale: 2, // Resolução alta
        useCORS: true, // Para imagens de outros domínios (se aplicável)
        allowTaint: true, // Permite imagens mistas
        backgroundColor: '#ffffff',
        width: 600,
        height: elementoImagem.scrollHeight,
        logging: false // Menos logs no console
      });

      // Converte para blob PNG
      canvas.toBlob(async (blob) => {
        if (blob) {
          const nomeArquivo = `convocatoria_${this.jogo?.equipa_adv_nome?.replace(/\s+/g, '_') || 'jogo'}_${new Date().getTime()}.png`;

          // Tenta compartilhar nativamente (funciona em mobile para WhatsApp)
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], nomeArquivo, { type: 'image/png' })] })) {
            try {
              await navigator.share({
                files: [new File([blob], nomeArquivo, { type: 'image/png' })],
                title: 'Convocatória Oficial',
                text: 'Partilhe esta convocatória com fotos dos atletas!'
              });
              console.log('Imagem compartilhada nativamente (ex: WhatsApp).');
            } catch (shareError) {
              console.log('Falha no share nativo, usando download.');
              this.baixarImagem(blob, nomeArquivo);
            }
          } else {
            // Fallback: Baixa a imagem
            this.baixarImagem(blob, nomeArquivo);
          }


        }
      }, 'image/png');

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Erro ao gerar a imagem. Verifique se as fotos dos atletas existem em assets/img/jogadores/.');
    } finally {
      // Esconde o div
      elementoImagem.style.display = 'none';
    }
  }

  // **Método auxiliar: Baixa a imagem como arquivo**
  private baixarImagem(blob: Blob, nomeArquivo: string): void {
    const link = document.createElement('a');
    link.download = nomeArquivo;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  processarAtletas(): void {
    if (this.equipaAtual && this.equipaAtual.jogadores) {
      this.atletasDisponiveis = this.equipaAtual.jogadores.map(jogador => ({
        id_jogador: jogador.id,
        nome_jogador: jogador.nome,
        selecionado: false // Por padrão, nenhum atleta está selecionado
      }));
      this.loading = false;
    } else {
      this.errorMessage = 'Nenhum jogador encontrado para a equipa atual.';
      this.loading = false;
    }
  }

  // NOVO MÉTODO: Toggle seleção ao clicar na linha
  toggleSelecao(atleta: ConvocatoriaData): void {
    if (this.isModoVisualizacao) return; // Não permite seleção em modo visualização
    atleta.selecionado = !atleta.selecionado;
  }

  // Getter para contar selecionados (usado no HTML)
  get selecionadosCount(): number {
    return this.atletasDisponiveis.filter(atleta => atleta.selecionado).length;
  }

  get totalAtletas(): number {
    return this.atletasDisponiveis.length;
  }

  salvarConvocatoria(): void {
    this.loading = true;
    this.sbmSuccess = false;
    this.sbmError = false;

    const jogadoresConvocados = this.atletasDisponiveis
      .filter(atleta => atleta.selecionado)
      .map(atleta => atleta.id_jogador);

    if (this.idJogo && jogadoresConvocados.length > 0) {
      this.jogoService.salvarConvocatoria(this.idJogo, jogadoresConvocados).subscribe({
        next: (response) => {
          console.log('Convocatória salva com sucesso:', response);
          this.sbmSuccess = true;

          // Opcional: Redirecionar ou mostrar mensagem de sucesso
          this.isModoVisualizacao = true; // Volta para o modo de visualização após salvar
          this.carregarConvocatoria(); // Recarrega a convocatória para refletir as mudanças
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao salvar convocatória:', err);
          this.errorMessage = 'Erro ao salvar a convocatória. Tente novamente.';
          this.sbmError = true;
          this.loading = false;
        }
      });
    } else if (jogadoresConvocados.length === 0) {
      this.errorMessage = 'Selecione pelo menos um atleta para a convocatória.';
      this.sbmError = true;
      this.loading = false;
    } else {
      this.errorMessage = 'ID do jogo não disponível.';
      this.sbmError = true;
      this.loading = false;
    }
  }

  voltar(): void {
    this.router.navigate(['/listajogos']);
  }

  adicionarJogador(): void {
    // Lógica para adicionar jogadores à convocatória
    if (this.atletasDisponiveis.length > 0) {
      //adicionar à sessão a convocatória
      const data = JSON.stringify(this.atletasDisponiveis);
      localStorage.removeItem("convocatoria_jogo");
      localStorage.setItem("convocatoria_jogo", data);
      this.router.navigate(['/jogadorSeleccao/' + "-" + (localStorage.getItem("idequipa_escalao")) + '/' + this.idJogo]);
    } else {
      this.errorMessage = 'Equipa atual não está definida.';
    }
  }

  calcularHoraConcentracao(): void {
  if (!this.jogo?.hora) {
    this.horaConcentracao = 'Indefinida';
    return;
  }
  // Supondo que this.jogo.hora está no formato "HH:mm"
  const [horaStr, minutoStr] = this.jogo.hora.split(':');
  let hora = parseInt(horaStr, 10);
  const minuto = parseInt(minutoStr, 10);
  // Subtrai 1 hora
  hora = hora - 1;
  if (hora < 0) {
    hora = 23; // volta para o dia anterior (23 horas)
  }
  // Formata com zero à esquerda
  const horaFormatada = hora.toString().padStart(2, '0');
  const minutoFormatado = minuto.toString().padStart(2, '0');
  this.horaConcentracao = `${horaFormatada}:${minutoFormatado}`;
}

}
