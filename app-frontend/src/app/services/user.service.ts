import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { Comment, CommentRequest, Module, Transaction } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly host = 'http://localhost:3001';
  readonly host2 = 'http://34.42.51.137:3001';
  readonly apiUser = `${this.host2}/user`;
  

  constructor(
    private _http: HttpClient,
    private _localStorageService: LocalStorageService
  ) { }

  getPages(id: number): Observable<Module[]> {
    return this._http.get<Module[]>(`${this.apiUser}/pages/${id}`);
  }

  login(email: string, password: string): Observable<any> {
    return this._http.post(`${this.apiUser}/login`, {email, password});
  }

  getRoles(): Observable<any> {
    return this._http.get(`${this.apiUser}/roles`);
  }

  getComments(): Observable<Comment[]> {
    return this._http.get<Comment[]>(`${this.apiUser}/comment`);
  }

  addComment(comment: CommentRequest): Observable<Comment[]> {
    return this._http.post<Comment[]>(`${this.apiUser}/comment`, comment);
  }

  getContent(keyName: string): Observable<any> {
    return this._http.get(`${this.apiUser}/content/${keyName}`);
  }

  saveMessage(data: any): Observable<any> {
    return this._http.post(`${this.apiUser}/contact`, data);
  }

  getTransactions(id:number): Observable<Transaction[]> {
    return this._http.get<Transaction[]>(`${this.apiUser}/transactions/${id}`);
  }

  getMyProfile(id: number): Observable<any> {
    return this._http.get(`${this.apiUser}/profile/${id}`);
  }

  updateProfile(data: any): Observable<any> {
    return this._http.post(`${this.apiUser}/profile`, data);
  }

  updateNotifications(data: any): Observable<any> {
    return this._http.put(`${this.apiUser}/notifications`, data);
  }

  recoverPin(card: number): Observable<any> {
    return this._http.get(`${this.apiUser}/forgot-pin/${card}`);
  }

  updatePassword(email: any, password: any): Observable<any> {
    const data = {email, password};
    return this._http.put(`${this.apiUser}/password`, data);
  }
}
