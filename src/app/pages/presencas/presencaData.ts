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
}

interface staffPresencaData {
  id_staff: number;
  nome_staff:string;
  estado: string;
  motivo: string;
  estilo_estado: string;
}



