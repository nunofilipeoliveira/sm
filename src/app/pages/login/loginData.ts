interface loginData {
  id: number;
  nome: string;
  user: string;
  password: string;
  escalaoEpoca: escalao_epoca[];
}

interface escalao_epoca {
  id_escalao_epoca: number;
  descritivo_escalao: string;
}
