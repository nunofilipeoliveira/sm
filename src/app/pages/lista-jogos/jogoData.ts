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
    config?: JogoConfigData; // Modo de registo do jogo (NORMAL | CRONOMETRO)
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
    gr: boolean;
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
    licenca?: string; // Número da licença do jogador
    // Campos do modo cronómetro / timeline
    titular?: boolean; // Pertence ao 5 inicial
    emCampo?: boolean; // Está em campo neste momento
    excluidoAteSegundos?: number | null; // Tempo absoluto de jogo até ao qual está excluído (cartão azul)
    tempoJogoSegundos?: number; // Tempo de jogo (corrigido manualmente se tempoManual)
    tempoManual?: boolean;
    isTitular?: boolean; // Conveniência de UI
}

export interface JogoConfigData {
    id?: number;
    id_jogo: number;
    modo_registo: string; // 'NORMAL' | 'CRONOMETRO'
    duracao_parte_minutos: number;
    numero_partes: number;
    num_jogadores_iniciais: number;
    duracao_exclusao_azul_segundos: number;
    tempo_atual_segundos: number;
    jogadores?: JogadorJogo[];
}

export interface JogoEventoData {
    id?: number;
    id_jogo: number;
    id_parte: number;
    tempo_evento: string;
    tempo_segundos: number;
    tipo_evento: string;
    id_jogador?: number;
    id_jogador_secundario?: number;
    detalhe?: string | null;
    obs?: string | null;
    id_equipa?: number; // 0 = nossa equipa, 1 = equipa adversária
    nome_jogador?: string | null;
    nome_jogador_secundario?: string | null;
}

export interface AtualizarTempoJogoRequest {
    id_jogo: number;
    id_jogador: number;
    tempo_correcao_segundos: number;
    tempo_atual_segundos: number;
    tempo_atual_display?: string;
}
