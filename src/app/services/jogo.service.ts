import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

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
}
