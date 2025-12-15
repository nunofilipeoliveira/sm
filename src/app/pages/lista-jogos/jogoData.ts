export interface JogoData {
    id: number;
    epoca_id: number;
    equipa_id: number;
    tipoEquipa: string;
    data: Date;
    hora: string;
    local: string;
    golos_equipa: number;
    equipa_adv_id: number;
    equipa_adv_nome: string;
    tipoEquipa_adv: string;
    golos_equipa_adv: number;
    tipo_local: string;
    competicao_id: number;
    competicao_nome: string;
    competicao_outro_descritivo: string;
    arbitro_1: number;
    arbitro_2: number;
    estado: string;
    hora_concentracao: string;
    obs: string;
    numeroJogo: String;
    jogadores: JogadorJogo[];
}

export interface JogadorJogo {
    id_jogador: number;
    nome: string;
    capitao: boolean;
    numero: number;
    amarelo: number;
    azul: number;
    vermelho: number;
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
    isGR: boolean;
    // Novas estatísticas de jogo
    assistencias: number;
    recuperacoes_bola: number;
    perdas_bola: number;
    remates: number;
    faltas: number;
    // Novas estatísticas específicas para GR e jogadores de campo
    penalty_defesa: number; // Penalty defendido (GR)
    ld_defesa: number; // Livre Direto defendido (GR)
    penalty_falhado: number; // Penalty falhado (jogadores de campo)
    ld_falhado: number; // Livre Direto falhado (jogadores de campo)
    // Adicione a propriedade expanded aqui para que seja parte da interface original
    expanded?: boolean; // Adicione esta linha
    estado: string; // Ex: "Convocado", "Lesionado", "Suspenso", "Indisponível"
    obs: string; // Observações adicionais sobre o jogador na convocatória
}
