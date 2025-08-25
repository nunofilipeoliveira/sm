import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'idade',
  standalone: true,
})
export class IdadePipe implements PipeTransform {
  transform(dataNascimento: number, dataInicioEpoca: number, idadeEscalao: string): string {

    if (dataInicioEpoca == 0) {

      let dtNascimento: Date = new Date(parseInt(dataNascimento.toString().substring(0, 4)), parseInt(dataNascimento.toString().substring(4, 6)) - 1, parseInt(dataNascimento.toString().substring(6, 8)));
      let timeDiff = Math.abs(Date.now() - dtNascimento.getTime());
      let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);


      const hoje = new Date();
      let idade = hoje.getFullYear() - dtNascimento.getFullYear();
      const mes = hoje.getMonth() - dtNascimento.getMonth();

      // Ajuste a idade se o aniversário ainda não ocorreu este ano
      if (mes < 0 || (mes === 0 && hoje.getDate() < dtNascimento.getDate())) {
        idade--;
      }

      console.log("IDADE: data_nascimento:", dtNascimento);
      console.log("IDADE: hoje:", hoje);
      console.log("IDADE: idade:", idade);

      return idade.toString();

    }
    else {

      let dtNascimento: Date = new Date(parseInt(dataNascimento.toString().substring(0, 4)), parseInt(dataNascimento.toString().substring(4, 6)) - 1, parseInt(dataNascimento.toString().substring(6, 8)));
      let dtReferencia: Date = new Date(dataInicioEpoca, 12, 31); //31 de Dezembro do ano da epoca

      let idade = dtReferencia.getFullYear() - dtNascimento.getFullYear();
      const mes = dtReferencia.getMonth() - dtNascimento.getMonth();

      // Ajuste a idade se o aniversário ainda não ocorreu este ano
      if (mes < 0 || (mes === 0 && dtReferencia.getDate() < dtNascimento.getDate())) {
        idade--;
      }

      console.log("IDADE: idade:", idade);
      console.log("IDADE: idadeEscalao:", idadeEscalao);

      idade = 2  - (parseInt(idadeEscalao) - idade - 1);
      if (idade<1) {
        idade=idade-1;
      }
      return idade.toString();
    } 
  }


}
