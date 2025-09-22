import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FicheirosService {

  constructor(private http: HttpClient) { }



  uploadFoto({ parmIDFoto, foto }: { parmIDFoto: string; foto: any; }) {

    let urlTmp = environment.apiUrl + "/sm/uploadfoto/"+parmIDFoto+"/"+environment.tenant_id;
   // const headers = { 'Content-Type': 'multipart/form-data' };

    console.log("uploadfoto | ID:", parmIDFoto);
    console.log("uploadfoto | foto:", foto);


    let response = this.http.post<any>(urlTmp, foto, {
      observe: "response"
    });

    console.log("uploadfoto | response:", response);
    return response;

  }


    uploadLogoClube({ parmIdLogo, foto }: { parmIdLogo: string; foto: any; }) {

    let urlTmp = environment.apiUrl + "/sm/uploadLogo/"+parmIdLogo+"/"+environment.tenant_id;
   // const headers = { 'Content-Type': 'multipart/form-data' };

    console.log("uploadLogo | ID:", parmIdLogo);
    console.log("uploadLogo | foto:", foto);


    let response = this.http.post<any>(urlTmp, foto, {
      observe: "response"
    });

    console.log("uploadfoto | response:", response);
    return response;

  }


}
