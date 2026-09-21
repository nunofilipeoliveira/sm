import { environment } from '../../environments/environment';

/**
 * Console Guard
 * =============
 *
 * Objetivo: impedir que dados sensíveis (tokens JWT, passwords, dados pessoais,
 * URLs internas, corpos de pedidos) e mensagens de depuração apareçam na
 * consola do browser em produção, sem alterar a lógica da aplicação.
 *
 * - Em desenvolvimento (`environment.production === false`) o guard não faz
 *   nada, mantendo a consola totalmente funcional para debugging.
 * - Em produção os métodos de escrita do `console` são substituídos por no-ops
 *   ANTES do bootstrap da aplicação, pelo que nenhuma chamada feita pela app
 *   (ou por bibliotecas carregadas após o bootstrap) chega a escrever na
 *   consola.
 *
 * NOTA DE SEGURANÇA:
 *  Este guard é uma proteção em runtime. Como qualquer código do browser,
 *  pode teoricamente ser contornado por um atacante com DevTools. A defesa em
 *  profundidade exige também NÃO escrever dados sensíveis no código-fonte
 *  (ver remoção dos console.* mais críticos) e, idealmente, impor a regra
 *  TSLint `no-console` para impedir novos statements.
 *
 *  Se for mesmo necessário diagnosticar erros em produção, defina
 *  `KEEP_ERRORS_IN_PRODUCTION` para true — apenas `console.error` permanece
 *  ativo. O default é desligar também `console.error` porque mensagens de erro
 *  HTTP podem transportar payloads e dados sensíveis.
 */
const KEEP_ERRORS_IN_PRODUCTION = false;

/** Métodos de escrita da consola que são neutralizados em produção. */
const CONSOLE_METHODS_TO_DISABLE = [
  'debug',
  'dir',
  'error',
  'group',
  'groupCollapsed',
  'groupEnd',
  'info',
  'log',
  'table',
  'trace',
  'warn'
] as const;

const noop = (): void => undefined;

/**
 * Ativa a proteção da consola. Deve ser chamado no `main.ts`, antes do
 * `platformBrowserDynamic().bootstrapModule(...)`.
 */
export function configureConsoleGuard(enabled: boolean = environment.production): void {
  if (!enabled) {
    return;
  }

  const consoleRef = console as unknown as Record<string, unknown>;

  for (const method of CONSOLE_METHODS_TO_DISABLE) {
    if (!KEEP_ERRORS_IN_PRODUCTION || method !== 'error') {
      consoleRef[method] = noop;
    }
  }
}