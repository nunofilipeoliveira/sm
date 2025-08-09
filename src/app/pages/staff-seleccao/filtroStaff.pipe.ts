import { Pipe, PipeTransform  } from '@angular/core';
@Pipe({
  name: 'filtroStaffPipe',
  standalone: true,
})
export class FiltroStaffPipe implements PipeTransform {
  transform(values: staffSeleccao[], filter: string): staffSeleccao[] {
    if (!filter || filter.length === 0) {
      return values;
    }

    if (values.length === 0) {
      return values;
    }

    return values.filter((value:staffSeleccao) => {
      const nameFound =
        value.nome_Jogador.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    

      if (nameFound) {
        return value;
      }
      return "";
    });
  }
}
