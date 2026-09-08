import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PerformanceConfigData, PerformanceService } from './performance.service';

/**
 * Estado partilhado da configuração de performance da equipa atual.
 *
 * Centraliza a configuração (performance_config) para que o menu lateral,
 * a página de performance e as páginas de presença reajam de forma coerente:
 * quando a funcionalidade está desativada para a equipa, nada relacionado
 * com performance deve ser apresentado — é como se não existisse.
 */
@Injectable({
  providedIn: 'root'
})
export class PerformanceConfigService {

  private configSubject = new BehaviorSubject<PerformanceConfigData | null>(null);

  /** Observable com a configuração atual (null enquanto não carregada). */
  readonly config$ = this.configSubject.asObservable();

  constructor(private performanceService: PerformanceService) { }

  /** Configuração atual carregada. */
  get config(): PerformanceConfigData | null {
    return this.configSubject.value;
  }

  /**
   * A funcionalidade de performance considera-se ALIVA apenas quando tanto o
   * registo de classificações como a visualização de indicadores estão
   * permitidos para a equipa. Caso contrário, deve ser tratada como inexistente.
   */
  get performanceAtiva(): boolean {
    const config = this.configSubject.value;
    return !!config && config.permitir_registo && config.permitir_visualizacao;
  }

  /** Carrega a configuração da equipa indicada (escalao_epoca.id). */
  carregarConfig(parmIdEquipa: number): void {
    if (!parmIdEquipa || parmIdEquipa <= 0) { return; }
    this.performanceService.getPerformanceConfig(parmIdEquipa).subscribe({
      next: (config) => {
        this.configSubject.next(config ?? null);
      },
      error: (error) => {
        console.error('PerformanceConfigService | carregarConfig | erro', error);
      }
    });
  }

  /** Atualiza a configuração em memória (usado após gravar na gestão de equipa). */
  setConfig(parmConfig: PerformanceConfigData): void {
    this.configSubject.next(parmConfig);
  }

}