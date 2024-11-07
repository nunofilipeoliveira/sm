import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  private userLoggedIn = new Subject<boolean>();

  parmJson: string = ""
  urlTmp: string = "";
  errows: boolean = false;
  loginData!: loginData;


  constructor(private http: HttpClient, private router: Router) {
      this.userLoggedIn.next(false);
   }


  login(user: string, pass: string) {
    const headers = { 'Content-Type': 'application/json' };
    this.parmJson = "{\"user\":\"" + user + "\",\"pwd\":\"" + pass + "\"}";
    this.urlTmp = environment.apiUrl + "/sm/login";


    console.log("URL", this.urlTmp);
    console.log("json", this.parmJson);

    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });


  }



  getHistoricoLogins() {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/gethistoricoLogins";
    console.log("URL", this.urlTmp);
    console.log("json", this.parmJson);
    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });
  }





  createUser(parmUser: novouserData, parmPassWord: string) {
    const headers = { 'Content-Type': 'application/json' };

    console.log("parmUser", parmUser);
    console.log("idsEscalao", parmUser.idsEscalao);
    let tmpEscaloes;
    tmpEscaloes = parmUser.idsEscalao.split(";");
    console.log("tmpEscaloes", tmpEscaloes);
    this.parmJson = "{\"nome\":\"" + parmUser.nome + "\",\"user\":\"" + parmUser.user + "\",\"password\":\"" + parmPassWord + "\", \"escalaoEpoca\" :[  ";

    for (let i = 0; i < tmpEscaloes.length - 1; i++) {
      if (i > 0) {
        this.parmJson = this.parmJson + ","
      }
      this.parmJson = this.parmJson + "{\"id_escalao_epoca\":" + tmpEscaloes[i] + "}";

    }
    this.parmJson = this.parmJson + "]}";
    this.urlTmp = environment.apiUrl + "/sm/createuser";
    console.log("URL", this.urlTmp);
    console.log("json", this.parmJson);

    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });


  }



  validateCode(parmCode: string) {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/activateuser/" + parmCode;
    console.log("URL", this.urlTmp);
    return this.http.put<any>(this.urlTmp, { headers });
  }


  setLogin(parmLogin: loginData) {
    this.loginData = parmLogin;
    console.log("loginService - setLogin", this.loginData);
  }

  getLoginData(): loginData {
    console.log("loginService - getLogin", this.loginData);
    console.log("loginService - a avaliar loginData");
    if (this.loginData == undefined) {
      console.log("loginService - loginData==undefined");
      this.router.navigate(['/']);
    }
    return this.loginData;
  }

  clear() {
    this.loginData.id = 0;
    this.loginData.nome = "";
    this.loginData.user = "";
    this.loginData.password = "";
    localStorage.removeItem("UserLogin");


    return;
  }


  getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }


  setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }



}

