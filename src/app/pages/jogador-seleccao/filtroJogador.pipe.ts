import { Pipe, PipeTransform  } from '@angular/core';
@Pipe({
  name: 'filtroJogadorPipe',
  standalone: true,
})
export class FiltroJogadorPipe implements PipeTransform {
  transform(values: JogadorSeleccao[], filter: string): JogadorSeleccao[] {
    if (!filter || filter.length === 0) {
      return values;
    }

    if (values.length === 0) {
      return values;
    }

    return values.filter((value:JogadorSeleccao) => {
      const nameFound =
        value.nome_Jogador.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
      const escalaoFound =
        value.escalao.toLowerCase().indexOf(filter.toLowerCase()) !== -1;

      if (nameFound || escalaoFound) {
        return value;
      }
      return "";
    });
  }
}
