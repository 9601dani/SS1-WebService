import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ExternalService {
  private accounts = [
    {
      id: 1,
      nombre_usuario: 'juanperez',
      nombre_banco: 'Banco Nacional',
      email: 'juanperez.basic@banconacional.com',
      numero_cuenta: '1234567892'
    },
    {
      id: 2,
      nombre_usuario: 'mariagarcia',
      nombre_banco: 'Banco Internacional',
      email: 'mariagarcia.premium@bancointernacional.com',
      numero_cuenta: '1234567890'
    },
    {
      id: 3,
      nombre_usuario: 'pedroramirez',
      nombre_banco: 'Banco Metropolitano',
      email: 'pedroramirez.plus@bancometropolitano.com',
      numero_cuenta: '1234567891'
    }
  ];
  //RUTA PARA OBTENER LOS DATOS DE LAS CUENTAS BANCARIAS
  readonly apiAccountBank = 'http://localhost:3001/account-bank';

  constructor(
    private _http: HttpClient
  ) { }

  getAccountBank(accountNumber: string): Observable<any> {
    const account = this.accounts.find(acc => acc.numero_cuenta === accountNumber);
    if (account) {
      return of(account);
    } else {
      return of({ error: 'Cuenta no encontrada' });
    }
  }


}
