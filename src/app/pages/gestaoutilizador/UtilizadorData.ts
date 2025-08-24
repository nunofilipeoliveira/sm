// Adicione esta interface se não existir em outro lugar
export interface UtilizadorData {
  id: number;
  nome: string;
  user: string;
  perfil: string;
  email: string;
  estado: string; // '1' para ativo, '0' para inativo
}
