import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JogoService {

  
  URLGetAllJogosByEquipa = environment.apiUrl + "/sm/getAllJogosByEquipa";

  constructor(private http: HttpClient) { }

  getAllJogosByEquipa(equipaId: number) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetAllJogosByEquipa + '/' + equipaId;
      console.log('JogoService | url:', this, urltmp);
      return this.http.put<any>(urltmp, { headers });
    }

  getAllCompeticoes() {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = environment.apiUrl + "/sm/getAllCompeticoes";
    console.log('JogoService | url:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });
  }

    createJogo(jogo: JogoData): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = environment.apiUrl + "/sm/createJogo";
      console.log('JogoService | url:', this, urltmp);
      console.log('JogoService | jogo:', jogo);
      return this.http.put<any>(urltmp, jogo, { headers });
  }


  updateJogo(jogo: JogoData): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = environment.apiUrl + "/sm/updateJogo";
      console.log('JogoService | url:', this, urltmp);
      console.log('JogoService | jogo:', jogo);
      return this.http.put<any>(urltmp, jogo, { headers });
  }

  deleteJogo(jogoId: number): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = environment.apiUrl + "/sm/deleteJogo/" + jogoId;
      console.log('JogoService | url:', this, urltmp);
      return this.http.put<any>(urltmp, { headers });
  }

  getJogoById(jogoId: number): Observable<JogoData> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = environment.apiUrl + "/sm/getJogoById/" + jogoId;
      console.log('JogoService | url:', this, urltmp);
      return this.http.put<JogoData>(urltmp, { headers });
  }

  salvarConvocatoria(jogoId: number, atletasIds: number[]): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = environment.apiUrl + "/sm/salvarConvocatoria";
    const body = {
      id: jogoId,
      jogadoresConvocados: atletasIds
    };
      console.log('JogoService | url:', this, urltmp);
      console.log('JogoService | body:', body);
      return this.http.put<any>(urltmp, body, { headers });
  }

  getConvocatoriaByJogoId(jogoId: number): Observable<ConvocatoriaDataWS> {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = environment.apiUrl + "/sm/getConvocatoriaByJogoId/" + jogoId;
      console.log('JogoService | url:', this, urltmp);
      return this.http.put<ConvocatoriaDataWS>(urltmp, { headers });
  }


}
