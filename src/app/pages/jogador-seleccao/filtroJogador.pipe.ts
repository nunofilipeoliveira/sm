import { Pipe, PipeTransform  } from '@angular/core';
@Pipe({
  name: 'filtroJogadorPipe',
  standalone: true,
})
export class FiltroJogadorPipe implements PipeTransform {
  transform(values: JogadorSeleccao[], nameFilter: string, equipeFilter: string): JogadorSeleccao[] {
    let filtered = values;

    // Filter by name
    if (nameFilter && nameFilter.length > 0) {
      filtered = filtered.filter((value: JogadorSeleccao) => {
        const nameFound = value.nome_Jogador.toLowerCase().indexOf(nameFilter.toLowerCase()) !== -1;
        const escalaoFound = value.escalao.toLowerCase().indexOf(nameFilter.toLowerCase()) !== -1;
        return nameFound || escalaoFound;
      });
    }

    // Filter by equipe
    if (equipeFilter && equipeFilter !== 'todas') {
      filtered = filtered.filter((value: JogadorSeleccao) => value.escalao === equipeFilter);
    }

    return filtered;
  }
}
