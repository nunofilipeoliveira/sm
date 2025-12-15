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

  private formatDate(date: any): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-PT');
  }
}
