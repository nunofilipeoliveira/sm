interface JogoData {
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
    arbitro_1: number;
    arbitro_2: number;
    estado: string;
}