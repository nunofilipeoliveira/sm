interface ConvocatoriaData {
  id_jogador: number;
  nome_jogador: string;
  selecionado: boolean; // Indica se o jogador foi selecionado para a convocatória
  // Adicione outros campos relevantes para o jogador na convocatória, se necessário
}

interface ConvocatoriaDataWS {
  id: number;
    jogadoresConvocados: number[];
}
