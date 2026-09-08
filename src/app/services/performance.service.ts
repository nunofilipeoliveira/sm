import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginServiceService } from './login-service.service';

/**
 * Ponto de evolução da classificação de um atleta num treino
 * (utilizado para o gráfico de evolução da performance).
 * Espelha o DTO sm.core.data.PerformanceEvolucaoTreinoData.
 */
export interface PerformanceEvolucaoTreinoData {
  id_presenca: number;
  // Data do treino no formato AAAAMMDD.
  data: number;
  hora: string;
  // Classificação atribuída ao atleta no treino (1 a 5). Null se não avaliado.
  classificacao: number | null;
}

/**
 * Registo histórico de presença/falta de um atleta num treino.
 * Espelha o DTO sm.core.data.PerformanceHistoricoData.
 */
export interface PerformanceHistoricoData {
  // Data do treino no formato AAAAMMDD.
  data: number;
  hora: string;
  nome_equipa: string;
  estado: string;
  motivo: string;
  // Classificação atribuída ao atleta no treino (1 a 5). Null se não avaliado.
  classificacao: number | null;
}

/**
 * Entrada da lista "Últimas Classificações" apresentada na ficha do jogador.
 */
export interface PerformanceUltimaClassificacaoData {
  // Data do treino no formato AAAAMMDD.
  data: number;
  classificacao: number | null;
}

/**
 * Resumo de performance de um atleta nos treinos.
 * Espelha o DTO sm.core.data.PerformanceResumoJogadorData.
 */
export interface PerformanceResumoJogadorData {
  id_jogador: number;
  nome_jogador: string;
  // Número de treinos com registo de presença do atleta no período.
  total_treinos: number;
  total_presencas: number;
  total_ausencias_avisou: number;
  total_ausencias_nao_avisou: number;
  total_lesoes: number;
  percentagem_presencas: number;
  // Número de treinos em que o atleta foi avaliado (classificação preenchida).
  treinos_avaliados: number;
  // Média das classificações (1 a 5) do atleta. Null se não houver treinos avaliados.
  media_classificacao: number | null;
  // Evolução da classificação do atleta ao longo dos treinos.
  evolucao: PerformanceEvolucaoTreinoData[];
  // Histórico completo de presenças/faltas do atleta.
  historico: PerformanceHistoricoData[];

  // ---- Campos de resumo utilizados pela ficha do jogador ----
  // Número de treinos com classificação registada.
  total_classificacoes: number;
  // Média global das classificações (1 a 5). Null se não houver classificações.
  media_global: number | null;
  // Média das classificações da última semana. Null se não houver classificações.
  media_semanal: number | null;
  // Média das classificações do último mês. Null se não houver classificações.
  media_mensal: number | null;
  // Tendência da evolução: 'SUBIDA' | 'DESCIDA' | 'ESTAVEL'.
  tendencia?: string;
  // Últimas classificações registadas (mais recentes primeiro).
  ultimasClassificacoes: PerformanceUltimaClassificacaoData[];
}

/**
 * Resumo de performance dos atletas de uma equipa nos treinos.
 * Espelha o DTO sm.core.data.PerformanceEquipaData.
 */
export interface PerformanceResumoEquipaData {
  id_equipa: number;
  nome_equipa: string;
  total_treinos: number;
  num_jogadores: number;
  total_presencas: number;
  total_ausencias_avisou: number;
  total_ausencias_nao_avisou: number;
  total_lesoes: number;
  percentagem_presencas: number;
  // Média das classificações (1 a 5) atribuídas aos atletas nos treinos. Null se não houver treinos avaliados.
  media_classificacao: number | null;
  jogadores: PerformanceResumoJogadorData[];
}

/**
 * Configuração de performance de uma equipa: controla se a equipa permite
 * o registo de classificações nos treinos e a visualização dos indicadores.
 * Espelha o DTO sm.core.data.PerformanceConfigData.
 */
export interface PerformanceConfigData {
  id_equipa: number;
  permitir_registo: boolean;
  permitir_visualizacao: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  URLPerformanceJogador = environment.apiUrl + "/sm/performance/jogador";
  URLPerformanceEquipa = environment.apiUrl + "/sm/performance/equipa";
  URLPerformanceConfig = environment.apiUrl + "/sm/performance/config";

  constructor(private http: HttpClient, private loginService: LoginServiceService) { }

  /**
   * Resumo de performance de um atleta.
   * Endpoint: GET /sm/performance/jogador/{idJogador}/{idUtilizador}/{tenantId}
   */
  getPerformanceJogador(parmIdJogador: number, parmDataInicio?: number, parmDataFim?: number): Observable<PerformanceResumoJogadorData> {
    const idUtilizador = this.loginService.getLoginData().id;
    const tenantId = environment.tenant_id;
    const url = `${this.URLPerformanceJogador}/${parmIdJogador}/${idUtilizador}/${tenantId}`;

    let params = new HttpParams();
    if (parmDataInicio) { params = params.set('dataInicio', parmDataInicio.toString()); }
    if (parmDataFim) { params = params.set('dataFim', parmDataFim.toString()); }

    console.log("PerformanceService | getPerformanceJogador | url:", url, "params:", params.toString());
    return this.http.get<PerformanceResumoJogadorData>(url, { params });
  }

  /**
   * Resumo de performance dos atletas de uma equipa.
   * Endpoint: GET /sm/performance/equipa/{idEquipa}/{idUtilizador}/{tenantId}
   */
  getPerformanceEquipa(parmIdEquipa: number, parmIdJogador?: number, parmDataInicio?: number, parmDataFim?: number): Observable<PerformanceResumoEquipaData> {
    const idUtilizador = this.loginService.getLoginData().id;
    const tenantId = environment.tenant_id;
    const url = `${this.URLPerformanceEquipa}/${parmIdEquipa}/${idUtilizador}/${tenantId}`;

    let params = new HttpParams();
    if (parmIdJogador) { params = params.set('idJogador', parmIdJogador.toString()); }
    if (parmDataInicio) { params = params.set('dataInicio', parmDataInicio.toString()); }
    if (parmDataFim) { params = params.set('dataFim', parmDataFim.toString()); }

    console.log("PerformanceService | getPerformanceEquipa | url:", url, "params:", params.toString());
    return this.http.get<PerformanceResumoEquipaData>(url, { params });
  }

  /**
   * Configuração de performance da equipa (registo e visualização).
   * Endpoint: GET /sm/performance/config/{idEquipa}/{idUtilizador}/{tenantId}
   */
  getPerformanceConfig(parmIdEquipa: number): Observable<PerformanceConfigData> {
    const headers = { 'Content-Type': 'application/json' };
    const idUtilizador = this.loginService.getLoginData().id;
    const tenantId = environment.tenant_id;
    const url = `${this.URLPerformanceConfig}/${parmIdEquipa}/${idUtilizador}/${tenantId}`;

    console.log("PerformanceService | getPerformanceConfig | url:", url);
    return this.http.get<PerformanceConfigData>(url, { headers });
  }

  /**
   * Grava a configuração de performance da equipa.
   * Endpoint: PUT /sm/performance/config/{idUtilizador}/{tenantId}
   */
  gravarPerformanceConfig(parmConfig: PerformanceConfigData): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const idUtilizador = this.loginService.getLoginData().id;
    const tenantId = environment.tenant_id;
    const url = `${this.URLPerformanceConfig}/${idUtilizador}/${tenantId}`;

    console.log("PerformanceService | gravarPerformanceConfig | url:", url);
    return this.http.put<any>(url, parmConfig, { headers });
  }

}