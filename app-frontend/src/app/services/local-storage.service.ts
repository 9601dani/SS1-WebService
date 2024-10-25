import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  readonly TOKEN = 'token';
  readonly USER_ID = 'user_id';
  readonly EMAIL = 'user_email';
  readonly CURRENCY = 'currency';

  constructor(
  ) { }

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  setItem(key: string, value: any): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  getItem(key: string): any {
    if (this.isLocalStorageAvailable()) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.clear();
    }
  }


  setUserId(id: number): void {
    this.setItem(this.USER_ID, id);
  }

  getUserId(): number {
    return this.getItem(this.USER_ID);
  }

  setEmail(name: string): void {
    this.setItem(this.EMAIL, name);
  }

  getEmail(): string {
    return this.getItem(this.EMAIL);
  }

  logout(): void {
    this.clear();
  }

}
