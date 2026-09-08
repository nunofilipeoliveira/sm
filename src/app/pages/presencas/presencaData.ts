interface PresencaData {
  id: number;
  data: number;
  hora: string;
  id_escalao: number;
  escalao_descricao: string;
  data_criacao:string;
  id_utilizador_criacao: number;
  user_criacao: string;
  jogadoresPresenca: jogadorPresencaData[];
  staffPresenca: staffPresencaData[];
}


interface jogadorPresencaData {
  id_jogador: number;
  nome_jogador:string;
  estado: string;
  motivo: string;
  estilo_estado: string;
  apagar: boolean;
  // Classificação de desempenho no treino (1 a 5 estrelas). Null/undefined se ainda não avaliado.
  classificacao?: number | null;
}

interface staffPresencaData {
  id_staff: number;
  nome_staff:string;
  estado: string;
  motivo: string;
  estilo_estado: string;
}



