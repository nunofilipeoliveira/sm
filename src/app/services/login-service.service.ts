import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { of } from 'rxjs'
import { map, catchError } from 'rxjs/operators';
import { EquipaService } from './equipa.service';
import { PresencaService } from './presenca.service';
import { UtilizadorData } from '../pages/gestaoutilizador/UtilizadorData';
import { UtilizadorParaAtivarData } from '../pages/gestaoutilizador/UtilizadorParaAtivarData';
import e from 'express';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  private userLoggedIn = new Subject<boolean>();


  parmJson: string = ""
  urlTmp: string = "";
  errows: boolean = false;
  loginData!: loginData; // Pode ser inicializado como null ou com valores padrão
  private AUTH_TOKEN_KEY = 'AuthToken'; // Chave para armazenar o token no localStorage

  constructor(private http: HttpClient, private router: Router, private equipaService: EquipaService, private presencaService: PresencaService) {
    this.isAuthenticated().subscribe((isAuth: boolean) => {
      this.userLoggedIn.next(isAuth);
    }); // Inicializa com o estado de autenticação atual
  }



  login(user: string, pass: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const body = { user: user, pwd: pass, tenant_id: environment.tenant_id };
    this.urlTmp = environment.apiUrl + "/sm/login";

    console.log("URL", this.urlTmp);
    //console.log("json", body);

    // Assumindo que o backend retorna um objeto com o token (ex: { ..., token: 'seu_token_jwt' })
    return this.http.put<any>(this.urlTmp, body, { headers });
  }

  // Novo método para armazenar o token
  setAuthToken(token: string): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  // Novo método para obter o token
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }


  // Método para verificar se o token é válido
  isAuthenticated(): Observable<boolean> {
    const token = this.getAuthToken();
    console.info('🚨 LoginService: Verificando autenticação, token:', token);
    this.urlTmp = environment.apiUrl + "/sm/isAuthenticated";


    if (!token) {
      console.warn('🚨 LoginService: Nenhum token encontrado. Usuário não autenticado.');
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }
    // Chama o backend para validar o token
    console.info('🚨 LoginService: Token encontrado, validando...');
    return this.http.put<boolean>(`${this.urlTmp}`, { token }).pipe(
      catchError(err => {
        console.error('Erro de autenticação', err);
        return of(false);
      })
    );
  }





  // Novo método para validar o token no backend
  validateAuthToken(): Observable<any> {
    const token = this.getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    this.parmJson = "{\"token\":\"" + token + "\"}";
    this.urlTmp = environment.apiUrl + "/sm/isAuthenticated";

    console.log("URL", this.urlTmp);
    console.log("json", this.parmJson);

    // Assumindo que o backend retorna um objeto com o token (ex: { ..., token: 'seu_token_jwt' })
    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });
  }

  getHistoricoLogins() {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/gethistoricoLogins";
    console.log("URL", this.urlTmp);
    //console.log("json", this.parmJson);
    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });
  }

  createUser(parmUser: novouserData, parmPassWord: string) {
    const headers = { 'Content-Type': 'application/json' };

    console.log("LoginWS | parmUser", parmUser);
    console.log("LoginWS | user", parmUser.user);
    console.log("LoginWS | idsEscalao", parmUser.idsescalao);
    let tmpEscaloes;
    tmpEscaloes = parmUser.idsescalao.split(";");
    console.log("LoginWS | tmpEscaloes", tmpEscaloes);
    this.parmJson = "{\"nome\":\"" + parmUser.nome + "\",\"user\":\"" + parmUser.user + "\",\"password\":\"" + parmPassWord + "\", \"escalaoEpoca\" :[  ";

    for (let i = 0; i < tmpEscaloes.length; i++) {
      if (i > 0) {
        this.parmJson = this.parmJson + ","
      }
      this.parmJson = this.parmJson + "{\"id_escalao_epoca\":" + tmpEscaloes[i] + "}";

    }
    this.parmJson = this.parmJson + "]}";
    this.urlTmp = environment.apiUrl + "/sm/createuser/" + environment.tenant_id;
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
    console.log("loginService - setLogin");
    this.userLoggedIn.next(true); // Notifica que o utilizador está logado
  }

  getLoginData(): loginData {
    console.log("loginService - getLogin");
    // Se loginData não estiver definido, tenta carregar do localStorage (se necessário)
    // ou redireciona para login se não houver sessão ativa.
    if (!this.loginData && this.isAuthenticated()) {
      const loginTokenString = localStorage.getItem('token');
      if (loginTokenString) {
        this.loginData = JSON.parse(loginTokenString) as loginData;
      } else {
        this.router.navigate(['/']);
      }

      return {} as loginData; // Retorna um objeto vazio para evitar erros de tipo
    } else if (!this.isAuthenticated()) {
      console.log("loginService - Não autenticado, redirecionando para login.");
      this.router.navigate(['/']);
      return {} as loginData; // Retorna um objeto vazio para evitar erros de tipo
    }
    return this.loginData;
  }

  clear() {
    console.log("loginService - Clear");
    // Limpa o token e os dados de login
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem("UserLogin"); // Manter se ainda for usado para algo específico
    localStorage.removeItem("idequipa_escalao");
    localStorage.removeItem("descritivo_escalao");
    localStorage.removeItem('token'); // Limpa o token do localStorage
    localStorage.removeItem("jogadores_selecionados");
    localStorage.removeItem("convocatoria_jogo");
    localStorage.removeItem("convocatoria_jogo_id");
    this.loginData = {} as loginData; // Limpa os dados em memória
    this.equipaService.clear(); // Limpa os dados da equipa
    this.presencaService.clear(); // Limpa os dados de presença
    this.userLoggedIn.next(false); // Notifica que o utilizador fez logout
    this.router.navigate(['/']); // Redireciona para a página de login

  }

  clearEquipa() {
    console.log("loginService - clearEquipa");
    // Limpa o token e os dados de login
    localStorage.removeItem("idequipa_escalao");
    localStorage.removeItem("descritivo_escalao");
    this.equipaService.clear(); // Limpa os dados da equipa
    this.presencaService.clear(); // Limpa os dados de presença

  }




  getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }

  setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }


  extendSession(): Observable<string> {
    const token = this.getAuthToken(); // Obtém o token atual
    const headers = { 'Content-Type': 'application/json' };
    const body = { token }; // Corpo da requisição com o token
    this.urlTmp = environment.apiUrl + "/sm/extendSession"; // URL do endpoint
    console.log("URL", this.urlTmp);
    console.log("json", body);
    // Faz a requisição PUT para estender a sessão
    return this.http.put<any>(this.urlTmp, body, { headers }).pipe( // Use 'any' para o tipo de retorno
      map(response => {
        console.log("Resposta recebida:", response);
        const newToken = response.token; // Acessa a propriedade 'token' do objeto JSON
        if (newToken) {
          this.setAuthToken(newToken); // Armazena o novo token
          console.log("Novo token armazenado:", newToken);
          this.loginData.token = newToken; // Atualiza o token em loginData
          return newToken; // Retorna o novo token
        } else {
          console.warn("Nenhum novo token recebido.");
          return ''; // Retorna uma string vazia se não houver novo token
        }
      }),
      catchError(error => {
        console.error("Erro ao estender a sessão:", error);
        return of(''); // Retorna uma string vazia em caso de erro
      })
    );
  }


  getAllUser() {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/getAllUser/" + + environment.tenant_id;
    console.log("URL", this.urlTmp);
    return this.http.put<any>(this.urlTmp, { headers });
  }

  getUser(parmIdUser: number) {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/getUser/" + parmIdUser + '/' + environment.tenant_id;
    console.log("URL", this.urlTmp);
    return this.http.put<any>(this.urlTmp, { headers });
  }


  getEscaloesByUser(parmIdUser: number) {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/getEscaloesByUser/" + parmIdUser;
    console.log("URL", this.urlTmp);
    return this.http.put<any>(this.urlTmp, { headers });
  }

  // NOVO MÉTODO: Atualiza o usuário e seus escalões
  updateUserWithEscaloes(userId: number, escalaoIds: number[]): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const body = {

      escalaoIds: escalaoIds,

    };
    // ATENÇÃO: Você precisará criar este endpoint no seu backend para receber e processar esses dados.
    const url = `${environment.apiUrl}/sm/updateUserWithEscaloes/${userId}`;
    console.log('LoginService: Enviando atualização de usuário e escalões:', body);
    return this.http.put<any>(url, body, { headers });
  }


  //ATUALIZAR DADOS DO UTILIZADOR
  updateUser(userId: number, userData: UtilizadorData): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const url = `${environment.apiUrl}/sm/updateUser/${userId}`;
    console.log('LoginService: Enviando atualização de usuário:', userData);
    return this.http.put<any>(url, userData, { headers });
  }

  createUserToAtivate(userData: UtilizadorParaAtivarData): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const url = `${environment.apiUrl}/sm/createUtilizador/${environment.tenant_id}`;
    console.log('LoginService: Enviando criação de usuário para ativação:', userData);
    console.log('URL:', url);
    return this.http.put<any>(url, userData, { headers });
  }


  getAllUserWait() {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/getAllUserWait/" + + environment.tenant_id;
    console.log("URL", this.urlTmp);
    return this.http.put<any>(this.urlTmp, { headers });
  }

  // Método para reenviar email de ativação (exemplo)
  reenviarEmailAtivacao(userData: UtilizadorParaAtivarData): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    // Adapte esta URL e o corpo da requisição para o seu endpoint de backend real
    const url = `${environment.apiUrl}/sm/reenviarEmailAtivacao/` + environment.tenant_id;
    console.log('LoginService: Reenviando email de ativação para:', userData);
    console.log(' URL:', url);

    // Retorne um Observable, simulando uma chamada HTTP
    return this.http.put<any>(url, userData, { headers });
  }

  getUserbyUserName(userName: String): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const url = `${environment.apiUrl}/sm/getUserByUserName/${userName}` + '/' + environment.tenant_id;
    console.log('LoginService: Buscando usuário por nome:', userName);
    console.log(' URL:', url);
    return this.http.put<any>(url, { headers });
  }

  enableUser(userId: number): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const url = `${environment.apiUrl}/sm/enableUser/${userId}`;
    console.log('LoginService: Habilitando usuário:', userId);
    console.log(' URL:', url);
    return this.http.put<any>(url, { headers });
  }

  disableUser(userId: number): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const url = `${environment.apiUrl}/sm/disableUser/${userId}`;
    console.log('LoginService: Desabilitando usuário:', userId);
    console.log(' URL:', url);
    return this.http.put<any>(url, { headers });
  }

  resetPWD(userId: number): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const url = `${environment.apiUrl}/sm/resetPWD/${userId}`;
    console.log('LoginService: Resetando senha do usuário:', userId);
    console.log(' URL:', url);
    return this.http.put<any>(url, { headers });
  }

}
