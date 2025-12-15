export interface EstatisticaJogador {
  id_jogador: number;
  nome: string;
  jogos: number;
  golos: number;
  cartao_amarelo: number;
  cartao_azul: number;
  cartao_vermelho: number;
  // Estatísticas detalhadas de golos
  golos_p: number;
  golos_ld: number;
  golos_pp: number;
  golos_up: number;
  golos_normal: number;
  golos_s_p: number;
  golos_s_ld: number;
  golos_s_up: number;
  golos_s_pp: number;
  golos_s_normal: number;
  // Estatísticas de jogo
  assistencias: number;
  recuperacoes_bola: number;
  perdas_bola: number;
  remates: number;
  faltas: number;
  // Estatísticas específicas
  penalty_defesa: number;
  ld_defesa: number;
  penalty_falhado: number;
  ld_falhado: number;
}
