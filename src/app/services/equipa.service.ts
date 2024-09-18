import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipaService {


  URL = environment.apiUrl + "/sm/getEquipa/"
  URLGetEquipaLight = environment.apiUrl + "/sm/getEquipaLight/"
  URLGetJogador = environment.apiUrl + "/sm/getJogador/"
  URLGetStaff = environment.apiUrl + "/sm/getStaff/"
  URLGravarJogador = environment.apiUrl + "/sm/updateJogador/"
  URLGravarStaff = environment.apiUrl + "/sm/updateStaff/"
  URLJogadoresDisponiveis = environment.apiUrl + "/sm/getJogadoreDisponiveis/"
  URLgetFaltas = environment.apiUrl + "/sm/getFaltas/"
  URLgetCountPresencas = environment.apiUrl + "/sm/getCountPresencas/"

  parmJson: string = ""
  errows: boolean = false;
  equipa!: EquipaData;
  body_json: string = "";

  constructor(private http: HttpClient) {
  }


  getEquipabyID(id: string | null) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URL + id;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });
  }

  getEquipabyIDLight(id: string | null) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetEquipaLight + id;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });
  }



  getJogadoresDisponiveis(id: number) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLJogadoresDisponiveis + id;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });
  }


  getFaltasByJogador(id: number) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLgetFaltas + id;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });
  }

  getCountPresencasByJogador(id: number) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLgetCountPresencas + id;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });
  }


  updateJogador(idUtilizador: number | null, parmJogadorData: jogadorData) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGravarJogador + idUtilizador;
    console.log('EquipaService | utl:', this, urltmp);

    this.body_json = '{'
      + '"id" :' + parmJogadorData.id + ','
      + '"nome" :\"' + parmJogadorData.nome + '\",'
      + '"nome_completo" :\"' + parmJogadorData.nome_completo + '\",'
      + '"data_nascimento" :' + parmJogadorData.data_nascimento + ','
      + '"email" :\"' + parmJogadorData.email + '\",'
      + '"telemovel" :\"' + parmJogadorData.telemovel + '\",'
      + '"pai_nome" :\"' + parmJogadorData.pai_nome + '\",'
      + '"pai_email" :\"' + parmJogadorData.pai_email + '\",'
      + '"pai_telemovel" :\"' + parmJogadorData.pai_telemovel + '\",'
      + '"mae_nome" :\"' + parmJogadorData.mae_nome + '\",'
      + '"mae_email" :\"' + parmJogadorData.mae_email + '\",'
      + '"mae_telemovel" :\"' + parmJogadorData.mae_telemovel + '\",'
      + '"morada" :\"' + parmJogadorData.morada + '\",'
      + '"cidade" :\"' + parmJogadorData.cidade + '\",'
      + '"codigo_postal" :\"' + parmJogadorData.codigo_postal + '\",'
      + '"observacoes" :\"' + parmJogadorData.observacoes + '\",'
      + '"numero" :\"' + parmJogadorData.numero + '\",'
      + '"licenca" :' + parmJogadorData.licenca + ','
      + '"nif" :' + parmJogadorData.nif + ','
      + '"cc" :\"' + parmJogadorData.cc + '\"}'


    console.log("updateJogador | Json:", this.body_json);

    return this.http.put<any>(urltmp, this.body_json, { headers });
  }


  updateStaff(idUtilizador: number | null, parmStaffData: staffData) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGravarStaff + idUtilizador;
    console.log('EquipaService | utl:', this, urltmp);

    this.body_json = '{'
      + '"id" :' + parmStaffData.id + ','
      + '"nome" :\"' + parmStaffData.nome + '\",'
      + '"nome_completo" :\"' + parmStaffData.nome_completo + '\",'
      + '"data_nascimento" :' + parmStaffData.data_nascimento + ','
      + '"email" :\"' + parmStaffData.email + '\",'
      + '"telemovel" :\"' + parmStaffData.telemovel + '\",'
      + '"morada" :\"' + parmStaffData.morada + '\",'
      + '"codigo_postal" :\"' + parmStaffData.codigo_postal + '\"}'

    console.log("updateStaff | Json:", this.body_json);

    return this.http.put<any>(urltmp, this.body_json, { headers });
  }


  setEquipa(parmEquipa: EquipaData) {
    this.equipa = parmEquipa;
    console.log("equipaService - setEquipa", this.equipa);
  }

  getEquipa(): EquipaData {
    console.log("equipaService - getEquipa", this.equipa);
    return this.equipa;
  }

  clear() {
    console.log("equipaService - Clear");
    this.equipa.id = 0;
    this.equipa.escalao = "";
    localStorage.removeItem("idequipa_escalao");
    return;
  }


  getJogadorbyId(parmJogadorid: number): jogadorData {

    const equipa = this.getEquipa() as EquipaData;
    for (let i = 0; i < equipa.jogadores.length; i++) {
      if (equipa.jogadores[i].id == parmJogadorid)
        return equipa.jogadores[i];
    }
    return equipa.jogadores[0];
  }

  loadJogadorbyId(parmJogadorid: number) {

    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetJogador + parmJogadorid;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });

  }

  loadStaffbyId(parmStaffId: number) {

    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetStaff + parmStaffId;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });

  }



}
