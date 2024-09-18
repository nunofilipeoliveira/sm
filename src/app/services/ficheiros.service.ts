import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FicheirosService {

  constructor(private http: HttpClient) { }



  uploadFoto(parmIDFoto: string, foto: any) {

    let urlTmp = environment.apiUrl + "/sm/uploadfoto/"+parmIDFoto;
   // const headers = { 'Content-Type': 'multipart/form-data' };

    console.log("uploadfoto | ID:", parmIDFoto);
    console.log("uploadfoto | foto:", foto);


    return this.http.post<any>(urlTmp, foto, {
      observe: "response",
      withCredentials: true,
    });

  }


}
