import { Pipe, PipeTransform  } from '@angular/core';
@Pipe({
  name: 'HistoricoLoginPipe',
  standalone: true,
})
export class HistoricoLoginsPipe implements PipeTransform {
  transform(values: historicologinsdata[], filter: string): historicologinsdata[] {
    if (!filter || filter.length === 0) {
      return values;
    }

    if (values.length === 0) {
      return values;
    }

    return values.filter((value:historicologinsdata) => {
      const nameFound =
        value.nome.toLowerCase().indexOf(filter.toLowerCase()) !== -1;

      if (nameFound ) {
        return value;
      }
      return "";
    });
  }
}
