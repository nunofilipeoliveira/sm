import { PresencaComponent } from './../pages/presenca/presenca.component';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresencaService {


  URLPresenca = environment.apiUrl + "/sm/presenca";
  URLUpdatePresenca = environment.apiUrl + "/sm/updatepresenca/";
  URLGetPresenca = environment.apiUrl + "/sm/getPresencaByDatas/";
  URLGetPresencabyID = environment.apiUrl + "/sm/getPresencaById/";
  URLGetHistoricobyID = environment.apiUrl + "/sm/getHistoricoById/";
  URLisPresencabyEquipaDataHora = environment.apiUrl + "/sm/isPresencabyEquipaDataHora/";
  URL_TOTAL_TRAININGS = environment.apiUrl + "/sm/dashboard/getTotalTrainings";
  URL_AVG_ATHLETES = environment.apiUrl + "/sm/dashboard/getAverageAthletes";
  URL_ABSENCE_PERCENTAGE = environment.apiUrl + "/sm/dashboard/getAbsencePercentage";
  URL_TRAININGS_PER_MONTH = environment.apiUrl + "/sm/dashboard/trainingsPerMonth";
  URL_ATTENDANCE_DISTRIBUTION = environment.apiUrl + "/sm/dashboard/attendanceDistribution";


  parmJson: string = ""
  errows: boolean = false;
  equipa: EquipaData | undefined;
  body_json: string = "";

  private jogadoresPresenca: jogadorPresencaData[] = [];
  private staffPresenca: staffPresencaData[] = [];
  private data_presenca = {
    "year": 0,
    "month": 0,
    "day": 0
  }
  private hora = { hour: 0, minute: 0 };
  private idFicha = 0;
  private presenca: PresencaData;

  constructor(private http: HttpClient) {
    this.presenca = {
      id: 0,
      data: 0,
      hora: "",
      id_escalao: 0,
      escalao_descricao: "",
      data_criacao: "",
      id_utilizador_criacao: 0,
      user_criacao: "",
      jogadoresPresenca: [],
      staffPresenca: [],
    };
  }

  setData_Presenca(parmAno: number, parmMes: number, parmDia: number) {
    this.data_presenca.day = parmDia;
    this.data_presenca.month = parmMes;
    this.data_presenca.year = parmAno;
  }

  getData_Presenta() {
    return this.data_presenca;
  }

  setHora(parmHora: number, parmMinute: number) {
    this.hora.hour = parmHora;
    this.hora.minute = parmMinute;
  }
  gethora() {
    return this.hora;
  }

  clear() {
    this.hora.hour = 0;
    this.hora.minute = 0;
    this.data_presenca.year = 0;
    this.data_presenca.month = 0;
    this.data_presenca.day = 0;
    this.jogadoresPresenca = [];
    this.staffPresenca = [];
    this.idFicha = 0;
  }

  setPresenca(parmJogadoresPresenca: jogadorPresencaData[]) {
    this.jogadoresPresenca = parmJogadoresPresenca;
  }

  getPresenca(): jogadorPresencaData[] {
    return this.jogadoresPresenca;
  }

  setStaffPresenca(parmStaffPresenca: staffPresencaData[]) {
    this.staffPresenca = parmStaffPresenca;
  }

  getStaffPresenca(): staffPresencaData[] {
    return this.staffPresenca;
  }

  setIdFicha(parmIdFicha: number) {
    this.idFicha = parmIdFicha;
  }

  getIdFicha(): number {
    return this.idFicha;
  }

  setPresencaTmp(parmPresenca: PresencaData) {
    this.presenca = parmPresenca;
  }

  getPresencaTmp(): PresencaData {
    return this.presenca;
  }

  createPresenca(parmPresenca: PresencaData) {
    const headers = { 'Content-Type': 'application/json' };

    this.body_json = '{'
      + '"data": ' + parmPresenca.data + ','
      + '"hora": \"' + parmPresenca.hora + ' \",'
      + '"id_escalao" : ' + parmPresenca.id_escalao + ','
      + '"escalao_descricao" :\"' + parmPresenca.escalao_descricao + '\",'
      + '"data_criacao" :\"' + parmPresenca.data_criacao + '\",'
      + '"id_utilizador_criacao" :' + parmPresenca.id_utilizador_criacao + ','
      + '"user_criacao" :\"' + parmPresenca.user_criacao + '\",'
      + '"jogadoresPresenca" : [ {'

    for (let i = 0; i < parmPresenca.jogadoresPresenca.length; i++) {

      this.body_json = this.body_json + '"id_jogador": ' + parmPresenca.jogadoresPresenca[i].id_jogador + ','
        + '"nome_jogador": "' + parmPresenca.jogadoresPresenca[i].nome_jogador + '",'
        + '"estado" :\"' + parmPresenca.jogadoresPresenca[i].estado + '\",'
        + '"motivo" :\"' + parmPresenca.jogadoresPresenca[i].motivo + '\"}'

      if ((parmPresenca.jogadoresPresenca.length - i) > 1) {
        this.body_json = this.body_json + ',{'
      }

    }


    this.body_json = this.body_json + '  ],'
      + '"staffPresenca" : [ {'
    for (let i = 0; i < parmPresenca.staffPresenca.length; i++) {

      this.body_json = this.body_json + '"id_staff": ' + parmPresenca.staffPresenca[i].id_staff + ','
        + '"nome_staff": "' + parmPresenca.staffPresenca[i].nome_staff + '",'
        + '"estado" :\"' + parmPresenca.staffPresenca[i].estado + '\",'
        + '"motivo" :\"' + parmPresenca.staffPresenca[i].motivo + '\"}'

      if ((parmPresenca.staffPresenca.length - i) > 1) {
        this.body_json = this.body_json + ',{'
      }

    }



    this.body_json = this.body_json + ' ] }';



    console.log("PresencaService | createPresenca | url: ", this.URLPresenca)
    console.log("PresencaService | createPresenca | body: ", this.body_json)
    return this.http.put<any>(this.URLPresenca + '/' + environment.tenant_id, this.body_json, { headers });


  }


  updatePresenca(parmPresenca: PresencaData, parmIDutilizador: number) {
    const headers = { 'Content-Type': 'application/json' };

    this.body_json = '{'
      + '"id" : ' + parmPresenca.id + ','
      + '"data": ' + parmPresenca.data + ','
      + '"hora": \"' + parmPresenca.hora + ' \",'
      + '"id_escalao" : ' + parmPresenca.id_escalao + ','
      + '"escalao_descricao" :\"' + parmPresenca.escalao_descricao + '\",'
      + '"data_criacao" :\"' + parmPresenca.data_criacao + '\",'
      + '"id_utilizador_criacao" :' + parmPresenca.id_utilizador_criacao + ','
      + '"user_criacao" :\"' + parmPresenca.user_criacao + '\",'
      + '"jogadoresPresenca" : [ {'

    for (let i = 0; i < parmPresenca.jogadoresPresenca.length; i++) {

      this.body_json = this.body_json + '"id_jogador": ' + parmPresenca.jogadoresPresenca[i].id_jogador + ','
        + '"nome_jogador": "' + parmPresenca.jogadoresPresenca[i].nome_jogador + '",'
        + '"estado" :\"' + parmPresenca.jogadoresPresenca[i].estado + '\",'
        + '"motivo" :\"' + parmPresenca.jogadoresPresenca[i].motivo + '\"}'

      if ((parmPresenca.jogadoresPresenca.length - i) > 1) {
        this.body_json = this.body_json + ',{'
      }

    }


    this.body_json = this.body_json + '  ],'
      + '"staffPresenca" : [ {'
    for (let i = 0; i < parmPresenca.staffPresenca.length; i++) {

      this.body_json = this.body_json + '"id_staff": ' + parmPresenca.staffPresenca[i].id_staff + ','
        + '"nome_staff": "' + parmPresenca.staffPresenca[i].nome_staff + '",'
        + '"estado" :\"' + parmPresenca.staffPresenca[i].estado + '\",'
        + '"motivo" :\"' + parmPresenca.staffPresenca[i].motivo + '\"}'

      if ((parmPresenca.staffPresenca.length - i) > 1) {
        this.body_json = this.body_json + ',{'
      }

    }



    this.body_json = this.body_json + ' ] }';



    console.log("PresencaService | update | url: ", this.URLUpdatePresenca + parmIDutilizador)
    console.log("PresencaService | update | body: ", this.body_json)
    return this.http.put<any>(this.URLUpdatePresenca + parmIDutilizador, this.body_json, { headers });


  }


  getPresencasByDatas(parmDataInicio: string, parmDataFim: string, parmIdEquipa: number) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetPresenca + parmDataInicio + '_' + parmDataFim + '_' + parmIdEquipa;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });

  }

  isPresencaByEquipaDataHora(parmIdEquipa: number, parmData: number, parmHora: string) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLisPresencabyEquipaDataHora + parmIdEquipa + '_' + parmData + '_' + parmHora;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });

  }



  getPresencasByid(parmId: number) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetPresencabyID + parmId;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });

  }


  getHistoricoByid(parmId: number) {
    const headers = { 'Content-Type': 'application/json' };
    const urltmp = this.URLGetHistoricobyID + parmId;
    console.log('EquipaService | utl:', this, urltmp);
    return this.http.put<any>(urltmp, { headers });

  }


  getTotalTrainings(parmEquipaID:number): Observable<number> {
    // Adapte o endpoint e o tipo de requisição conforme seu backend
    return this.http.get<number>(this.URL_TOTAL_TRAININGS + '/' + parmEquipaID);
  }
  getAverageAthletesPerTraining(parmEquipaID:number): Observable<number> {
    // Adapte o endpoint e o tipo de requisição conforme seu backend
    return this.http.get<number>(this.URL_AVG_ATHLETES + '/' + parmEquipaID);
  }
  getAbsencePercentage(parmEquipaID:number): Observable<number> {
    // Adapte o endpoint e o tipo de requisição conforme seu backend
    return this.http.get<number>(this.URL_ABSENCE_PERCENTAGE + '/' + parmEquipaID);
  }
  getTrainingsPerMonth(): Observable<{ month: string, count: number }[]> {
    // Adapte o endpoint e o tipo de requisição conforme seu backend
    return this.http.get<{ month: string, count: number }[]>(this.URL_TRAININGS_PER_MONTH);
  }
  getAttendanceDistribution(): Observable<{ present: number, excusedAbsence: number, unexcusedAbsence: number, notCalled: number }> {
    // Adapte o endpoint e o tipo de requisição conforme seu backend
    return this.http.get<{ present: number, excusedAbsence: number, unexcusedAbsence: number, notCalled: number }>(this.URL_ATTENDANCE_DISTRIBUTION);
  }



}
