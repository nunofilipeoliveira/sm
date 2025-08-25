import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { empty, Observable } from 'rxjs';
import e from 'express';


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
  URLremoveJogadorEquipa = environment.apiUrl + "/sm/equipa/removeJogadorEquipa/"
  URLremoveStaffEquipa = environment.apiUrl + "/sm/equipa/removeStaffEquipa/"
  URLAddJogadorEquipa = environment.apiUrl + "/sm/equipa/addJogadorEquipa/"
  URLAddStaffEquipa = environment.apiUrl + "/sm/equipa/addStaffEquipa/"
  URLGetAllStaff = environment.apiUrl + "/sm/getAllStaff/"
  URLGetAllStaffDisponivel = environment.apiUrl + "/sm/getAllStaffDisponivel/"  
  URLAddStaff = environment.apiUrl + "/sm/addStaff/"
  URLAddJogador = environment.apiUrl + "/sm/addJogador/"
  URLGetEpocaAtual = environment.apiUrl + "/sm/getEpocaAtual/";
  URLGetEquipasPorEpoca = environment.apiUrl + "/sm/getAllEquipasEpocaAtual/";
  URLGetAllEpocas = environment.apiUrl + "/sm/getAllEpocas/";
  URLSetEpocaAtual = environment.apiUrl + "/sm/setEpocaAtual/";
  URLGetAllEscaloes = environment.apiUrl + "/sm/getEscaloes";
  URLcreateEscalaoEpoca = environment.apiUrl + "/sm/createEscalaoEpoca/";
  URLdeleteEscalaoEpoca = environment.apiUrl + "/sm/deleteEscalaoEpoca/";
  URLGetEscalaoByEquipa = environment.apiUrl + "/sm/getEscalaoByEquipa/";

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


  setEquipa(parmEquipa: EquipaData | null) {
    this.equipa = parmEquipa as EquipaData;
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
    this.setEquipa(empty() as unknown as EquipaData );
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


 removeJogadorEquipa(jogador: jogadorData): Observable<any> {
  const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLremoveJogadorEquipa + this.getEquipa().id;
    console.log('EquipaService | utl:', urltmp);

    this.body_json = JSON.stringify(jogador);
    console.log("addJogadorEquipa | Json:", this.body_json);

    return this.http.put<any>(urltmp, this.body_json, { headers });
}


  addJogadorEquipa(jogador: jogadorData): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLAddJogadorEquipa + this.getEquipa().id;
    console.log('EquipaService | utl:', urltmp);

    this.body_json = JSON.stringify(jogador);
    console.log("addJogadorEquipa | Json:", this.body_json);

    return this.http.put<any>(urltmp, this.body_json, { headers });

    
  }


    addStaffEquipa(staff: staffData): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLAddStaffEquipa + this.getEquipa().id;
    console.log('EquipaService | utl:', urltmp);

    this.body_json = JSON.stringify(staff);
    console.log("addStaffEquipa | Json:", this.body_json);

    return this.http.put<any>(urltmp, this.body_json, { headers });

    
  }


   removeStaffEquipa(staff: staffData): Observable<any> {
  const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLremoveStaffEquipa + environment.tenant_id;
    console.log('EquipaService | utl:', urltmp);

    this.body_json = JSON.stringify(staff);
    console.log("removeStaffEquipa | Json:", this.body_json);

    return this.http.put<any>(urltmp, this.body_json, { headers });
}


   getAllStaff(): Observable<any> {
  const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetAllStaff + environment.tenant_id;
    console.log('EquipaService | utl:', urltmp);
    this.body_json = "{}"; // Assuming no additional parameters are needed
    return this.http.put<any>(urltmp, this.body_json, { headers });
}

   getAllStaffDisponivel(parm: number): Observable<any> {
  const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetAllStaffDisponivel + environment.tenant_id+ '/' + parm;
    console.log('EquipaService | utl:', urltmp);
    this.body_json = "{}"; // Assuming no additional parameters are needed
    return this.http.put<any>(urltmp, this.body_json, { headers });
}

   addStaff(staff: staffData, idUtilizador: number): Observable<any> {
  const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLAddStaff + environment.tenant_id + '/' + idUtilizador;
    console.log('EquipaService | utl:', urltmp);

    this.body_json = JSON.stringify(staff);
    console.log("removeStaffEquipa | Json:", this.body_json);

    return this.http.put<any>(urltmp, this.body_json, { headers });
}

addJogador(jogador: jogadorData, idUtilizador: number): Observable<any> {
  const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLAddJogador + environment.tenant_id + '/' + idUtilizador;
    console.log('EquipaService | utl:', urltmp);

    this.body_json = JSON.stringify(jogador);
    console.log("addJogador | Json:", this.body_json);
    return this.http.put<any>(urltmp, this.body_json, { headers });
  } 

  getEpocaAtual(): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetEpocaAtual + environment.tenant_id;
    return this.http.put<any>(urltmp, this.body_json, { headers });
  }

    getAllEpocas(): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetAllEpocas + environment.tenant_id;
    return this.http.put<any>(urltmp, this.body_json, { headers });
  }


  setEpocaAtual(epocaId: number): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLSetEpocaAtual + epocaId + '/'  + environment.tenant_id;
    console.log('EquipaService | setEpocaAtual | url:', urltmp);
    // O corpo da requisição pode variar dependendo do seu backend.
    // Pode ser um PUT com um corpo vazio, ou um POST com o ID no corpo.
    return this.http.put<any>(urltmp, {}, { headers }); 
  }
  
  getEquipasPorEpoca(): Observable<any> {
      const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetEquipasPorEpoca + environment.tenant_id;
    return this.http.put<any>(urltmp, this.body_json, { headers });
  }

  getAllEscaloes(): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetAllEscaloes 
    return this.http.put<any>(urltmp, this.body_json, { headers });
  }

    createEscalaoEpoca(epocadata: escalao_epoca): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLcreateEscalaoEpoca  + environment.tenant_id;
    this.body_json = JSON.stringify(epocadata);
    console.log('EquipaService | createEscalaoEpoca | url:', urltmp);
    console.log('EquipaService | createEscalaoEpoca | body:', this.body_json);
    // O corpo da requisição pode variar dependendo do seu backend.
    // Pode ser um PUT com um corpo vazio, ou um POST com o ID no corpo.
    return this.http.put<any>(urltmp, this.body_json, { headers }); 
  }

    deleteEscalaoEpoca(epocadata: escalao_epoca): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLdeleteEscalaoEpoca  + environment.tenant_id;
    this.body_json = JSON.stringify(epocadata);
    console.log('EquipaService | createEscalaoEpoca | url:', urltmp);
    console.log('EquipaService | createEscalaoEpoca | body:', this.body_json);
    // O corpo da requisição pode variar dependendo do seu backend.
    // Pode ser um PUT com um corpo vazio, ou um POST com o ID no corpo.
    return this.http.put<any>(urltmp, this.body_json, { headers }); 
  }

  getEscalaoByEquipa(idEquipa: number): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetEscalaoByEquipa  + idEquipa;
    console.log('EquipaService | getEscalaoByEquipa | url:', urltmp);
    return this.http.put<any>(urltmp, this.body_json, { headers });
  }

}
