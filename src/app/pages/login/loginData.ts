interface loginData {
  id: number;
  nome: string;
  user: string;
  password: string;
  escalaoEpoca: escalao_epoca[];
  token?: string; // Adicionar esta linha para incluir o token
  perfil: string;
}

interface escalao_epoca {
  id_escalao_epoca: number;
  descritivo_escalao: string;
}
