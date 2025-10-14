interface ConvocatoriaData {
  id_jogador: number;
  nome_jogador: string;
  selecionado: boolean;
  obs: string; // Observações sobre o jogador na convocatória
  // Adicione outros campos relevantes para o jogador na convocatória, se necessário
}

interface ConvocatoriaDataWS {
  id: number;
  jogadoresConvocatoria: JogadorConvocado[];
}


interface JogadorConvocado {
  id_jogador: number;
  nome: string;
  estado: string; // Ex: "Convocado", "Lesionado", "Suspenso"
  obs: string; // Observações adicionais sobre o jogador na convocatória
}