import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { Module } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly apiUser = 'http://localhost:3001/user';

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
}
