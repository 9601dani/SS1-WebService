import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CardsResponse } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  readonly host = 'http://localhost:3001';
  readonly host2 = 'http://34.42.51.137:3001';
  readonly apiAdmin = `${this.host2}/admin`;
  constructor(
    private _http: HttpClient
  ) { }

  verifyCard(cardNumber: string): Observable<any> {
    return this._http.post(`${this.apiAdmin}/verify-card`, {cardNumber});
  }

  registerUser(user: any): Observable<any> {
    return this._http.post(`${this.apiAdmin}/register-user`, user);
  }

  getAllCards(): Observable<CardsResponse> {
    return this._http.get<CardsResponse>(`${this.apiAdmin}/get-all-cards`);
  }

  updateCardState(id: number, state: string,reason:string, reportType: string): Observable<any> {
    return this._http.put(`${this.apiAdmin}/update-card-state`, {id, state, reason, reportType});
  }

  updateExchangeRate(key_name:string, key_valueN: number): Observable<any> {
    const key_value = key_valueN.toString();
    return this._http.put(`${this.apiAdmin}/update-exchange`, {key_name, key_value});
  }

  reduceBalance(card: string, amount: number): Observable<any> {
    return this._http.put(`${this.apiAdmin}/reduce-balance`, {card, amount});
  }

  getCardByNumber(cardNumber: string): Observable<any> {
    return this._http.get(`${this.apiAdmin}/get-card/${cardNumber}`);
  }

  getReportOne(): Observable<any> {
    return this._http.get<any>(`${this.apiAdmin}/report1`);
  }

  getReportTwo(): Observable<any> {
    return this._http.get<any>(`${this.apiAdmin}/report2`);
  }

  getReportThree(card: string): Observable<any> {
    return this._http.get<any>(`${this.apiAdmin}/report3/${card}`);
  }

  getReportFour(): Observable<any> {
    return this._http.get<any>(`${this.apiAdmin}/report4`);
  }

}
