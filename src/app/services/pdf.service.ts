import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Define interfaces for PDF data structures
export interface GameData {
  id: number;
  data: Date;
  hora: string;
  local: string;
  escalao: string;
  competicao_nome: string;
  numeroJogo: string;
  equipa_adv_nome: string;
  golos_equipa: number;
  golos_equipa_adv: number;
  tipo_local: string;
  nomeClube: string;
  equipa_adv_id: number;
  competicao_id: number;
  clube_id: number; // Added club ID for logo
}

export interface PlayerData {
  id_jogador: number;
  nome: string;
  numero: number;
  capitao: boolean;
  isGR: boolean;
  expanded?: boolean;
  estado?: string; // Status do jogador (CONVOCADO, LESIONADO, etc.)
  obs?: string; // Observações
  // Statistics fields - populated when game is CONCLUIDO
  golos_normal?: number;
  golos_p?: number;
  golos_ld?: number;
  golos_pp?: number;
  golos_up?: number;
  golos_s_normal?: number;
  golos_s_p?: number;
  golos_s_ld?: number;
  golos_s_pp?: number;
  golos_s_up?: number;
  assistencias?: number;
  recuperacoes_bola?: number;
  perdas_bola?: number;
  remates?: number;
  faltas?: number;
  penalty_defesa?: number;
  ld_defesa?: number;
  penalty_falhado?: number;
  ld_falhado?: number;
  amarelo?: number;
  azul?: number;
  vermelho?: number;
}

// ============================================================================
// Exportação de PDF - Controlo de Presenças
// ============================================================================

/** Célula de um treino na tabela de presenças (uma letra: P, A, F, N, L ou vazio) */
export interface AttendanceCellPdf {
  letra: string;
  estado: string;
  motivo: string;
}

/** Treino (coluna) apresentado no PDF */
export interface AttendanceTreinoPdf {
  id: number;
  data: string; // dd/mm
  hora: string;
}

/** Linha (atleta ou staff) apresentada no PDF */
export interface AttendanceRowPdf {
  id: number;
  nome: string;
  foto: string;
  fotoFallback: string;
  total: number;
  presencas: number;
  faltaJustificada: number;
  faltaInjustificada: number;
  faltaLesao: number;
  celulas: AttendanceCellPdf[];
}

/** Conjunto de dados necessários para exportar o quadro de presenças */
export interface AttendanceExportData {
  clubeNome: string;
  clubeLogo: string;
  clubeLogoFallback: string;
  clubeCor: string;
  escalao: string;
  periodo: string;
  filtrosAtletas: string[];
  modoResumo: boolean;
  geradoEm: string;
  dataFicheiro: string;
  treinos: AttendanceTreinoPdf[];
  contagensPorTreino: number[];
  atletas: AttendanceRowPdf[];
  staff: AttendanceRowPdf[];
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generateGameStatisticsPDF(
    gameData: GameData,
    players: PlayerData[]
  ): void {

    // Create a temporary container for the PDF content
    const container = this.createPDFContainer(gameData, players);
    document.body.appendChild(container);

    // Configure html2canvas options for high quality
    const canvasOptions = {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 1123, // A4 landscape width in pixels at 96 DPI
      height: 794, // A4 landscape height in pixels at 96 DPI
      scrollX: 0,
      scrollY: 0
    };

    // Generate canvas from HTML
    html2canvas(container, canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      // Create PDF in landscape mode
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to fit the page while maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      // Center the image on the page
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;

      pdf.addImage(imgData, 'PNG', x, y, width, height);

      // Save the PDF
      pdf.save(
        `Ficha_Estatisticas_${gameData.nomeClube}_vs_${gameData.equipa_adv_nome}_${this.formatDate(gameData.data)}.pdf`
      );

      // Clean up
      document.body.removeChild(container);
    }).catch((error) => {
      console.error('Error generating PDF:', error);
      document.body.removeChild(container);
    });
  }

  private createPDFContainer(gameData: GameData, players: PlayerData[]): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 1123px;
      height: 794px;
      background: #ffffff;
      font-family: 'Arial', sans-serif;
      color: #000000;
      padding: 12px;
      box-sizing: border-box;
      overflow: hidden;
    `;

    container.innerHTML = this.createPDFContent(gameData, players);
    return container;
  }

  private createPDFContent(gameData: GameData, players: PlayerData[]): string {
    const currentDate = new Date().toLocaleDateString('pt-PT');
    const currentTime = new Date().toLocaleTimeString('pt-PT');

    // Organize players - only show CONVOCADO players for statistics
    const availablePlayers = players.filter(p => p.estado === 'CONVOCADO');
    const allPlayers = [...availablePlayers];

    const playersRows = allPlayers.map((player, index) => {
      const displayName = `${player.nome}${player.capitao ? ' (C)' : ''}${player.isGR ? ' (GR)' : ''}`;
      const displayNumber = player.numero || '';

      // Helper function to get statistics value or empty string
      const getStatValue = (value: number | undefined): string => {
        return (value && value > 0) ? value.toString() : '';
      };

      // For goalkeepers, show goals conceded instead of goals scored
      const goalsForDisplay = player.isGR ? getStatValue(player.golos_s_normal) : getStatValue(player.golos_normal);
      const penaltyGoalsForDisplay = player.isGR ? getStatValue(player.golos_s_p) : getStatValue(player.golos_p);
      const freeKickGoalsForDisplay = player.isGR ? getStatValue(player.golos_s_ld) : getStatValue(player.golos_ld);
      const powerPlayGoalsForDisplay = player.isGR ? getStatValue(player.golos_s_pp) : getStatValue(player.golos_pp);
      const underPlayGoalsForDisplay = player.isGR ? getStatValue(player.golos_s_up) : getStatValue(player.golos_up);

      return `
        <tr style="${index % 2 === 0 ? 'background: #ffffff;' : 'background: #f5f5f5;'}">
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; width: 35px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; color: #000000; font-weight: bold; font-size: 10px; margin: 0 auto; border: 2px solid #000000;">
              ${displayNumber}
            </div>
          </td>
          <td style="padding: 6px 4px; border: 1px solid #000000; display: flex; align-items: center; vertical-align: middle;">
            <div style="display: flex; align-items: center; height: 24px">
             ${displayName}
            </div>
          </td>
          <!-- Statistics columns - populated with actual values when available -->
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${goalsForDisplay}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${penaltyGoalsForDisplay}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${freeKickGoalsForDisplay}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${powerPlayGoalsForDisplay}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${underPlayGoalsForDisplay}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.penalty_falhado)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.ld_falhado)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.assistencias)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.amarelo)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.azul)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.vermelho)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.faltas)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.recuperacoes_bola)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.perdas_bola)}
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #000000; font-weight: bold; font-size: 11px;">
            ${getStatValue(player.remates)}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="
        background: #ffffff;
        border: 2px solid #000000;
        overflow: hidden;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        font-family: 'Arial', sans-serif;
      ">
        <!-- Header Section -->
        <div style="
          background: #ffffff;
          color: #000000;
          padding: 15px;
          position: relative;
          flex-shrink: 0;
          border: 2px solid #000000;
          margin-bottom: 10px;
        ">
          <!-- Main Header Content -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <!-- Club Logo and Info -->
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; border: 2px solid #000000; overflow: hidden;">
                <img src="assets/img/clubes/clube_${gameData.clube_id}.png"
                     onerror="this.onerror=null; this.src='assets/img/clubes/default_clube.png'"
                     alt="Logotipo do Clube"
                     style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />
              </div>
              <div>
                <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #000000;">
                  FICHA DE ESTATÍSTICAS
                </h1>
                <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 500; color: #000000;">
                  ${gameData.nomeClube}
                </p>
                <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 500; color: #000000;">
                  ${gameData.escalao}
                </p>
              </div>
            </div>

            <!-- Game Details -->
            <div style="text-align: right;">
              <div style="background: #ffffff; color: #000000; padding: 15px; border: 2px solid #000000;">
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #000000;">
                  <img src="assets/img/clubes/clube_${gameData.equipa_adv_id}.png"
                       onerror="this.onerror=null; this.src='assets/img/clubes/default_clube.png'"
                       alt="Logotipo do Clube"
                       style="width: 30px; height: 30px; border-radius: 50%; background: #ffffff; border: 1px solid #000000; margin-right: 8px; vertical-align: middle;" />
                  VS ${gameData.equipa_adv_nome}
                </div>
                <div style="font-size: 11px; margin-bottom: 2px; color: #000000;">
                  ${gameData.competicao_nome}
                </div>
                <div style="font-size: 10px; color: #000000;">
                  Jogo Nº: ${gameData.numeroJogo}
                </div>
              </div>
            </div>
          </div>

          <!-- Match Information Row -->
          <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div style="text-align: center; background: #ffffff; color: #000000; padding: 8px; border: 1px solid #000000;">
              <div style="font-size: 10px; margin-bottom: 2px; font-weight: 600; color: #000000;">DATA & HORA</div>
              <div style="font-size: 11px; font-weight: 600; color: #000000;">${this.formatDate(gameData.data)} às ${gameData.hora}</div>
            </div>
            <div style="text-align: center; background: #ffffff; color: #000000; padding: 8px; border: 1px solid #000000;">
              <div style="font-size: 10px; margin-bottom: 2px; font-weight: 600; color: #000000;">LOCAL</div>
              <div style="font-size: 11px; font-weight: 600; color: #000000;">${gameData.local}</div>
            </div>
            <div style="text-align: center; background: #ffffff; color: #000000; padding: 8px; border: 1px solid #000000;">
              <div style="font-size: 10px; margin-bottom: 2px; font-weight: 600; color: #000000;">RESULTADO</div>
              <div style="font-size: 11px; font-weight: 600; color: #000000; height: 16px; border-bottom: 1px solid #000000; display: flex; align-items: center; justify-content: center;">
                ${gameData.golos_equipa} - ${gameData.golos_equipa_adv}
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Table Section -->
        <div style="padding: 15px; flex: 1; display: flex; flex-direction: column;">
          <!-- Table Title -->
          <div style="margin-bottom: 10px; text-align: center;">
            <h2 style="color: #000000; margin: 0 0 5px 0; font-size: 16px; font-weight: 700; border-bottom: 2px solid #000000; padding-bottom: 5px;">
              REGISTO DE ESTATÍSTICAS DO JOGO
            </h2>
            <p style="color: #000000; font-size: 10px; margin: 0; font-style: italic;">
              Estatísticas preenchidas automaticamente para jogos concluídos
            </p>
          </div>

          <!-- Statistics Table -->
          <div style="border: 2px solid #000000; overflow: hidden; flex: 1;">
            <table style="
              width: 100%;
              border-collapse: collapse;
              background: white;
              font-size: 10px;
            ">
              <thead>
                <tr style="background: #ffffff; color: #000000;">
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 8px; border: 1px solid #000000; width: 35px;">Nº</th>
                  <th style="padding: 8px 4px; text-align: left; font-weight: 600; font-size: 8px; border: 1px solid #000000; ">JOGADOR</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 40px;">Norm.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 40px;">Pen.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 40px;">LD.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 40px;">PP</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 40px;">UP</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 40px;">Pen.Falh.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 40px;">LD.Falh.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 40px;">Assist.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 30px;">Amar.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 30px;">Azul</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 30px;">Verm.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 60px;">Faltas.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 130px;">Recuperações.</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 130px;">Perdas</th>
                  <th style="padding: 8px 4px; text-align: center; font-weight: 600; font-size: 7px; border: 1px solid #000000; width: 130px;">Remates</th>
                </tr>
              </thead>
              <tbody>
                ${playersRows}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="margin-top: 10px; text-align: center; font-size: 9px; color: #000000; border-top: 1px solid #000000; padding-top: 5px;">
            Sport Manager - ${new Date().getFullYear()}
          </div>
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // Exportação de PDF - Controlo de Presenças
  // ===========================================================================

  /**
   * Gera um PDF em paisagem (A4) com o quadro de presenças tal como está
   * visível no ecrã (respeitando filtros de período, filtros de atleta,
   * ordenação e modo resumo/detalhe).
   */
  async generateAttendancePDF(data: AttendanceExportData): Promise<void> {
    // 1. Garantir que todas as imagens (clube + fotos dos atletas) estão em cache
    const dados = await this.resolveAttendanceImages(data);

    // 2. Largura de conteúdo (no modo detalhe pode ser maior que A4 se houver muitos treinos)
    const width = this.attendanceContentWidth(dados);

    // 3. Construir os dois blocos: cabeçalho (repete em cada página) e corpo
    const headerEl = this.createAttendanceContainer(this.buildAttendanceHeader(dados, width), width);
    const bodyEl = this.createAttendanceContainer(this.buildAttendanceBody(dados, width), width);
    document.body.appendChild(headerEl);
    document.body.appendChild(bodyEl);

    try {
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0
      };
      const canvases = await Promise.all([
        html2canvas(headerEl, options),
        html2canvas(bodyEl, options)
      ]);
      this.composeAttendancePDF(canvases[0], canvases[1], dados, width);
    } finally {
      document.body.removeChild(headerEl);
      document.body.removeChild(bodyEl);
    }
  }

  /** Cria o contentor temporário (fora do ecrã) onde o HTML é desenhado */
  private createAttendanceContainer(html: string, width: number): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${width}px;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      box-sizing: border-box;
      overflow: visible;
    `;
    container.innerHTML = html;
    return container;
  }

  /** Pré-carrega as imagens; caso a principal falhe, usa o fallback */
  private async resolveAttendanceImages(data: AttendanceExportData): Promise<AttendanceExportData> {
    const logo = await this.resolveImageUrl(data.clubeLogo, data.clubeLogoFallback);
    const atletas = await Promise.all(data.atletas.map(async (row) => ({
      ...row,
      foto: await this.resolveImageUrl(row.foto, row.fotoFallback)
    })));
    const staff = await Promise.all(data.staff.map(async (row) => ({
      ...row,
      foto: await this.resolveImageUrl(row.foto, row.fotoFallback)
    })));
    return { ...data, clubeLogo: logo, atletas, staff };
  }

  /** Devolve `url` se carregar, senão devolve `fallback` */
  private resolveImageUrl(url: string, fallback: string): Promise<string> {
    const attempt = (target: string): Promise<boolean> => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = target;
    });
    return attempt(url).then((ok) => {
      if (ok) {
        return url;
      }
      if (!fallback || fallback === url) {
        return url;
      }
      return attempt(fallback).then(() => fallback);
    });
  }

  /** Largura mínima A4 em px (1123px = 297mm @96dpi); no modo detalhe alarga se necessário */
  private attendanceContentWidth(data: AttendanceExportData): number {
    if (data.modoResumo) {
      return 1123;
    }
    const n = Math.max(data.treinos.length, 1);
    return Math.max(1123, 40 + 240 + 76 + this.attendanceTreinoColWidth(data) * n);
  }

  /** Largura de cada coluna de treino, dentro dos limites do ecrã */
  private attendanceTreinoColWidth(data: AttendanceExportData): number {
    const n = Math.max(data.treinos.length, 1);
    return Math.max(28, Math.min(60, Math.floor((1123 - 40 - 240 - 76) / n)));
  }

  /** Colunas da tabela - idênticas no cabeçalho e no corpo para alinhamento perfeito */
  private attendanceColGroup(data: AttendanceExportData): string {
    if (data.modoResumo) {
      return '<col /><col style="width:112px" /><col style="width:112px" /><col style="width:112px" /><col style="width:112px" /><col style="width:120px" />';
    }
    const n = Math.max(data.treinos.length, 1);
    const col = this.attendanceTreinoColWidth(data);
    const cols: string[] = ['<col />'];
    for (let i = 0; i < n; i++) {
      cols.push(`<col style="width:${col}px" />`);
    }
    cols.push('<col style="width:76px" />');
    return cols.join('');
  }

  /** Estilo de cor de cada estado (espelha as classes btn do ecrã) */
  private statusStyle(letra: string): { bg: string; fg: string } {
    switch (letra) {
      case 'P': return { bg: '#16a34a', fg: '#ffffff' };
      case 'A': return { bg: '#f59e0b', fg: '#ffffff' };
      case 'N': return { bg: '#6b7280', fg: '#ffffff' };
      case 'F': return { bg: '#ef4444', fg: '#ffffff' };
      case 'L': return { bg: '#06b6d4', fg: '#ffffff' };
      default: return { bg: '#f1f5f9', fg: '#94a3b8' };
    }
  }

  /** Taxa de presença tal como é calculada no ecrã (faltas por lesão não contam) */
  private taxaPresenca(row: AttendanceRowPdf): number | null {
    const total = row.presencas + row.faltaJustificada + row.faltaInjustificada;
    if (total <= 0) {
      return null;
    }
    return (row.presencas / total) * 100;
  }

  private formatTaxa(valor: number | null): string {
    if (valor === null) {
      return '-';
    }
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(valor) + '%';
  }

  private escapeHtml(value: string): string {
    return (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Cabeçalho do PDF (repetido em todas as páginas): identificação, filtros, legenda e colunas */
  private buildAttendanceHeader(d: AttendanceExportData, width: number): string {
    const brand = d.clubeCor && d.clubeCor.length > 0 ? d.clubeCor : '#0d6efd';
    const chip = (texto: string, bg: string, fg: string, border: string): string =>
      `<span style="display:inline-block;background:${bg};color:${fg};border:1px solid ${border};border-radius:12px;padding:3px 9px;font-size:10.5px;font-weight:700;">${this.escapeHtml(texto)}</span>`;

    const chips: string[] = [];
    chips.push(chip('Período: ' + d.periodo, '#eef2ff', '#4338ca', '#c7d2fe'));
    chips.push(chip(d.modoResumo ? 'Modo resumo' : 'Modo detalhe', '#ecfdf5', '#047857', '#a7f3d0'));
    if (d.filtrosAtletas.length > 0) {
      chips.push(chip('Atletas filtrados: ' + d.filtrosAtletas.join(', '), '#fff1f2', '#be123c', '#fecdd3'));
    }
    chips.push(chip('Gerado em ' + d.geradoEm, '#f8fafc', '#475569', '#e2e8f0'));

    const taxas = d.atletas.map((a) => this.taxaPresenca(a)).filter((t): t is number => t !== null);
    const taxaMedia = taxas.length > 0 ? taxas.reduce((s, t) => s + t, 0) / taxas.length : null;

    const stat = (valor: string, rotulo: string): string => `
      <div style="min-width:96px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:7px 12px;text-align:center;box-sizing:border-box;">
        <div style="font-size:17px;font-weight:800;color:${brand};line-height:1.1;">${valor}</div>
        <div style="font-size:8.5px;font-weight:700;letter-spacing:0.6px;color:#64748b;text-transform:uppercase;margin-top:3px;">${rotulo}</div>
      </div>`;

    const legendItem = (letra: string, texto: string): string => {
      const cor = this.statusStyle(letra === '–' ? '' : letra);
      return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:#374151;white-space:nowrap;">
        <span style="display:inline-block;min-width:20px;padding:2px 5px;border-radius:9px;background:${cor.bg};color:${cor.fg};font-size:9.5px;font-weight:800;text-align:center;">${letra}</span>${this.escapeHtml(texto)}</span>`;
    };

    const legenda = `
      <span style="font-size:9.5px;font-weight:800;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;">Legenda</span>
      ${legendItem('P', 'Presente')}
      ${legendItem('A', 'Ausente (avisou)')}
      ${legendItem('F', 'Ausente (não avisou)')}
      ${legendItem('N', 'Não convocado')}
      ${legendItem('L', 'Lesão')}
      ${legendItem('–', 'Sem registo')}`;

    const subtitulo = d.escalao && d.escalao.length > 0
      ? `${this.escapeHtml(d.clubeNome)} <span style="color:#cbd5e1;">&#124;</span> ${this.escapeHtml(d.escalao)}`
      : this.escapeHtml(d.clubeNome);

    const tabelaColunas = d.modoResumo ? this.attendanceHeadResumo(d) : this.attendanceHeadDetalhe(d);

    return `
      <div style="width:${width}px;box-sizing:border-box;background:#ffffff;padding:0 20px 14px;">
        <div style="height:9px;margin:0 -20px 14px;border-radius:0 0 6px 6px;background:linear-gradient(90deg, ${brand} 0%, ${brand} 80%, ${brand}55 100%);"></div>

        <div style="display:flex;align-items:center;gap:14px;">
          <img src="${d.clubeLogo}" style="width:58px;height:58px;object-fit:contain;border:1px solid #e5e7eb;border-radius:14px;background:#ffffff;padding:5px;box-sizing:border-box;flex:0 0 auto;" />
          <div style="flex:1;min-width:0;">
            <div style="font-size:21px;font-weight:800;letter-spacing:-0.3px;color:#111827;line-height:1.1;">Controlo de Presenças</div>
            <div style="font-size:12.5px;color:#4b5563;margin-top:4px;font-weight:600;">${subtitulo}</div>
          </div>
          <div style="display:flex;gap:8px;flex:0 0 auto;">
            ${stat(String(d.treinos.length), 'Treinos')}
            ${stat(String(d.atletas.length), 'Atletas')}
            ${stat(this.formatTaxa(taxaMedia), 'Taxa média')}
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">${chips.join('')}</div>

        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:11px;padding-top:10px;border-top:1px dashed #e5e7eb;">${legenda}</div>

        <div style="margin-top:11px;">${tabelaColunas}</div>
      </div>`;
  }

  /** Colunas do cabeçalho - modo detalhe (uma coluna por treino, com data e hora) */
  private attendanceHeadDetalhe(d: AttendanceExportData): string {
    const colunas = d.treinos.map((t) => `
      <th style="padding:7px 2px;text-align:center;font-size:10px;font-weight:800;border-left:1px solid #374151;line-height:1.25;white-space:nowrap;">
        <div>${this.escapeHtml(t.data)}</div>
        <div style="font-weight:500;font-size:8.5px;opacity:0.75;">${this.escapeHtml(t.hora)}</div>
      </th>`).join('');

    return `
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <colgroup>${this.attendanceColGroup(d)}</colgroup>
        <thead>
          <tr style="background:#111827;color:#ffffff;">
            <th style="padding:8px 10px;text-align:left;font-size:10.5px;font-weight:800;letter-spacing:0.8px;">ATLETA</th>
            ${colunas}
            <th style="padding:8px 8px;text-align:right;font-size:10.5px;font-weight:800;letter-spacing:0.8px;border-left:1px solid #374151;">TOTAL</th>
          </tr>
        </thead>
      </table>`;
  }

  /** Colunas do cabeçalho - modo resumo (totais por atleta) */
  private attendanceHeadResumo(d: AttendanceExportData): string {
    const col = (sigla: string, texto: string): string => `
      <th style="padding:7px 4px;text-align:center;font-size:12px;font-weight:800;border-left:1px solid #374151;line-height:1.2;">
        <div>${sigla}</div>
        <div style="font-weight:500;font-size:8.5px;opacity:0.75;white-space:nowrap;">${texto}</div>
      </th>`;

    return `
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <colgroup>${this.attendanceColGroup(d)}</colgroup>
        <thead>
          <tr style="background:#111827;color:#ffffff;">
            <th style="padding:8px 10px;text-align:left;font-size:10.5px;font-weight:800;letter-spacing:0.8px;">ATLETA</th>
            ${col('P', 'Presença')}
            ${col('FJ', 'Falta justif.')}
            ${col('FI', 'Falta inj.')}
            ${col('FL', 'Lesão')}
            ${col('TP', 'Taxa')}
          </tr>
        </thead>
      </table>`;
  }

  /** Corpo do PDF: linhas de atletas, totais (modo detalhe) e secção de staff */
  private buildAttendanceBody(d: AttendanceExportData, width: number): string {
    const totalColunas = d.modoResumo ? 6 : d.treinos.length + 2;
    let linhas = '';

    if (d.atletas.length === 0) {
      linhas += `<tr><td colspan="${totalColunas}" style="padding:28px 10px;text-align:center;color:#94a3b8;font-size:12px;font-style:italic;border-bottom:1px solid #eef2f7;">Sem registos de atletas para o período selecionado.</td></tr>`;
    } else {
      for (let i = 0; i < d.atletas.length; i++) {
        linhas += this.attendanceRow(d, d.atletas[i], i, false);
      }
    }

    if (!d.modoResumo && d.atletas.length > 0) {
      linhas += this.attendanceTotalsRow(d);
    }

    if (d.staff.length > 0) {
      linhas += `<tr><td colspan="${totalColunas}" style="background:#0f172a;color:#ffffff;font-size:9.5px;font-weight:800;letter-spacing:1.6px;padding:6px 10px;text-transform:uppercase;">Staff Técnico</td></tr>`;
      for (let i = 0; i < d.staff.length; i++) {
        linhas += this.attendanceRow(d, d.staff[i], i, true);
      }
    }

    return `
      <div style="width:${width}px;box-sizing:border-box;background:#ffffff;padding:0 20px 16px;">
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <colgroup>${this.attendanceColGroup(d)}</colgroup>
          <tbody>${linhas}</tbody>
        </table>
      </div>`;
  }

  /** Uma linha da tabela (atleta ou staff), com foto e estado de cada treino */
  private attendanceRow(d: AttendanceExportData, row: AttendanceRowPdf, idx: number, isStaff: boolean): string {
    const bg = isStaff
      ? (idx % 2 === 0 ? '#f8fafc' : '#f1f5f9')
      : (idx % 2 === 0 ? '#ffffff' : '#f9fafb');

    const nome = `
      <td style="padding:5px 10px;border-bottom:1px solid #eef2f7;background:${bg};vertical-align:middle;">
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="${row.foto}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid ${isStaff ? '#cbd5e1' : '#e2e8f0'};box-sizing:border-box;flex:0 0 auto;" />
          <span style="font-size:12px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(row.nome)}</span>
        </div>
      </td>`;

    const celulas = d.modoResumo ? this.resumoCells(row, bg) : this.detalheCells(d, row, bg);
    const total = d.modoResumo
      ? ''
      : `<td style="padding:5px 8px;text-align:right;border-bottom:1px solid #eef2f7;background:${bg};font-size:12px;font-weight:800;color:#111827;">${row.total}</td>`;

    return `<tr>${nome}${celulas}${total}</tr>`;
  }

  /** Células do modo detalhe: uma pastilha colorida por treino (P/A/F/N/L) */
  private detalheCells(d: AttendanceExportData, row: AttendanceRowPdf, bg: string): string {
    return d.treinos.map((_, index) => {
      const celula = row.celulas[index];
      const letra = celula && celula.letra ? celula.letra : '';
      const cor = this.statusStyle(letra);
      const texto = letra.length > 0 ? letra : '-';
      const extra = celula && (celula.estado || celula.motivo)
        ? ` title="${this.escapeHtml((celula.estado + ' ' + celula.motivo).trim())}"`
        : '';
      return `<td style="padding:5px 2px;text-align:center;border-bottom:1px solid #eef2f7;background:${bg};">
        <span${extra} style="display:inline-block;min-width:22px;padding:3px 0;border-radius:11px;background:${cor.bg};color:${cor.fg};font-size:11px;font-weight:800;line-height:1.2;">${texto}</span>
      </td>`;
    }).join('');
  }

  /** Células do modo resumo: totais P/FJ/FI/FL e taxa de presença */
  private resumoCells(row: AttendanceRowPdf, bg: string): string {
    const celula = (valor: number, corBg: string, corFg: string): string =>
      `<td style="padding:5px 4px;text-align:center;border-bottom:1px solid #eef2f7;background:${bg};">
        <span style="display:inline-block;min-width:26px;padding:3px 6px;border-radius:11px;background:${corBg};color:${corFg};font-size:11.5px;font-weight:800;">${valor}</span>
      </td>`;

    const taxa = `<td style="padding:5px 4px;text-align:center;border-bottom:1px solid #eef2f7;background:${bg};">
        <span style="display:inline-block;padding:3px 8px;border-radius:11px;background:#dbeafe;color:#1d4ed8;font-size:11.5px;font-weight:800;">${this.formatTaxa(this.taxaPresenca(row))}</span>
      </td>`;

    return celula(row.presencas, '#dcfce7', '#15803d')
      + celula(row.faltaJustificada, '#fef3c7', '#b45309')
      + celula(row.faltaInjustificada, '#fee2e2', '#b91c1c')
      + celula(row.faltaLesao, '#cffafe', '#0e7490')
      + taxa;
  }

  /** Linha de totais por treino (apenas no modo detalhe, como no ecrã) */
  private attendanceTotalsRow(d: AttendanceExportData): string {
    const celulas = d.treinos.map((_, index) => {
      const valor = d.contagensPorTreino[index] != null ? d.contagensPorTreino[index] : 0;
      return `<td style="padding:5px 2px;text-align:center;background:#e8eef6;color:#0f172a;font-size:11px;font-weight:800;border-top:2px solid #cbd5e1;border-bottom:1px solid #e5e7eb;">${valor}</td>`;
    }).join('');

    return `<tr>
      <td style="padding:6px 10px;background:#e8eef6;color:#0f172a;font-size:10.5px;font-weight:800;letter-spacing:0.6px;border-top:2px solid #cbd5e1;border-bottom:1px solid #e5e7eb;">TOTAL POR TREINO</td>
      ${celulas}
      <td style="background:#e8eef6;border-top:2px solid #cbd5e1;border-bottom:1px solid #e5e7eb;"></td>
    </tr>`;
  }

  /** Compõe o PDF: cabeçalho repetido em cada página + fatias do corpo + rodapé */
  private composeAttendancePDF(
    headerCanvas: HTMLCanvasElement,
    bodyCanvas: HTMLCanvasElement,
    data: AttendanceExportData,
    contentWidth: number
  ): void {
    const scale = 2; // valor usado em html2canvas (options.scale)
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const mmPorPx = pageWidth / contentWidth;
    const headerMm = (headerCanvas.height / scale) * mmPorPx;
    const footerMm = 7;
    const alturaUtil = Math.max(pageHeight - headerMm - footerMm, 25);
    const headerData = headerCanvas.toDataURL('image/png');

    const alturaCorpoPx = bodyCanvas.height / scale;
    let deslocamentoPx = 0;
    let pagina = 0;

    do {
      if (pagina > 0) {
        pdf.addPage();
      }
      pagina++;

      pdf.addImage(headerData, 'PNG', 0, 0, pageWidth, headerMm);

      const restantePx = alturaCorpoPx - deslocamentoPx;
      const fatiaMm = Math.min(alturaUtil, Math.max(restantePx * mmPorPx, 0.5));
      const fatiaPx = fatiaMm / mmPorPx;
      const fatia = this.cropCanvas(
        bodyCanvas,
        Math.round(deslocamentoPx * scale),
        Math.round(fatiaPx * scale)
      );
      pdf.addImage(fatia.toDataURL('image/png'), 'PNG', 0, headerMm, pageWidth, fatiaMm);

      // Rodapé com identificação e paginação
      const rodapeY = pageHeight - 3.5;
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      const rodape = `${data.clubeNome} - Controlo de Presencas - ${data.periodo}`;
      pdf.text(rodape, 12, rodapeY);
      pdf.text(`Pagina ${pagina}`, pageWidth - 12, rodapeY, { align: 'right' });

      deslocamentoPx += fatiaPx;
    } while (deslocamentoPx < alturaCorpoPx - 0.5);

    const nome = (valor: string): string => (valor || '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    pdf.save(`Presencas_${nome(data.clubeNome)}_${nome(data.escalao)}_${data.dataFicheiro}.pdf`);
  }

  /** Extrai uma fatia vertical do canvas (para páginas múltiplas) */
  private cropCanvas(source: HTMLCanvasElement, origemY: number, altura: number): HTMLCanvasElement {
    const y = Math.max(0, Math.min(origemY, source.height - 1));
    const h = Math.max(1, Math.min(altura, source.height - y));
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, y, source.width, h, 0, 0, source.width, h);
    }
    return canvas;
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-PT');
  }
}
