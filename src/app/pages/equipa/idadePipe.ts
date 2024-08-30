import { Pipe, PipeTransform  } from '@angular/core';
@Pipe({
  name: 'idade',
  standalone: true,
})
export class IdadePipe implements PipeTransform {
  transform(value: number): string {

    let dtNascimento :Date=new Date(parseInt(value.toString().substring(0,4)), parseInt(value.toString().substring(4,6)), parseInt(value.toString().substring(6,8)));
    let timeDiff = Math.abs(Date.now() - dtNascimento.getTime());
    let age = Math.floor((timeDiff / (1000 * 3600 * 24))/365.25);

   return age.toString();
  }
}
