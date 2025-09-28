import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ClubeData } from '../pages/gestao-clubes/clubesData';

@Injectable({
  providedIn: 'root'
})
export class ClubeService {

  URLGetAllClubes = environment.apiUrl + "/sm/getAllClubes";
  URLUpdateClube = environment.apiUrl + "/sm/updateClube";

  constructor(private http: HttpClient) { }

  getAllClubes() {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetAllClubes;
      console.log('ClubeService | url:', this, urltmp);
      return this.http.put<any>(urltmp, { headers });
    }

  updateClube(clube: ClubeData) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLUpdateClube;
      console.log('ClubeService | url:', this, urltmp);
      console.log('ClubeService | clube:', clube);
      return this.http.put<any>(urltmp, clube, { headers });
    } 

    getClube(clubeId: number) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = environment.apiUrl + "/sm/getClube/" + clubeId;
      console.log('ClubeService | url:', this, urltmp);
      return this.http.put<ClubeData>(urltmp, { headers });
    }


}
