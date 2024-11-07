import { Pipe, PipeTransform  } from '@angular/core';
@Pipe({
  name: 'idade',
  standalone: true,
})
export class IdadePipe implements PipeTransform {
  transform(value: number): string {

    let dtNascimento :Date=new Date(parseInt(value.toString().substring(0,4)), parseInt(value.toString().substring(4,6))-1, parseInt(value.toString().substring(6,8)));
    let timeDiff = Math.abs(Date.now() - dtNascimento.getTime());
    let age = Math.floor((timeDiff / (1000 * 3600 * 24))/365.25);


      const hoje = new Date();
      let idade = hoje.getFullYear() - dtNascimento.getFullYear();
      const mes = hoje.getMonth() - dtNascimento.getMonth();

      // Ajuste a idade se o aniversário ainda não ocorreu este ano
      if (mes < 0 || (mes === 0 && hoje.getDate() < dtNascimento.getDate())) {
        idade--;
      }

      console.log("IDADE: data_nascimento:",dtNascimento);
      console.log("IDADE: hoje:",hoje);
      console.log("IDADE: idade:",idade);




   return idade.toString();
  }


}
