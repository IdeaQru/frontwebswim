import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn: boolean = false; // Status login
  private apiUrl = 'http://localhost:3000/api/users';  // Ganti URL dengan API Node.js kamu

  constructor(private http: HttpClient) {}

  // Metode untuk register
  register(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
  login(userData: any): Observable<any> {
    this.loggedIn = true;
    return this.http.post(`${this.apiUrl}/login`, userData).pipe(
      tap((response: any) => {
        const token = response.data.token;
        const username = response.data.username;
        if (token) {
          localStorage.setItem('authToken', token);  // Simpan token di localStorage
          console.log('Token saved:', token);
        }
        if (username) {
          localStorage.setItem('authUsername', username);  // Simpan username di localStorage
          console.log('Username saved:', username);
        }
      })
    );
  }
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return this.loggedIn  || !!localStorage.getItem('authToken');; // Kembalikan status login
  }
  logout() {
    this.loggedIn = false;
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
  }
  getUserName(){
    return localStorage.getItem('authUsername');
  }
}
