// buku-acara.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BukuAcaraService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  fetchAtletData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get('http://localhost:3000/api/atlets', { headers });
  }

  fetchKelompokUmurData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get('http://localhost:3000/api/kelompok-umur', { headers });
  }

  fetchPerlombaanData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get('http://localhost:3000/api/perlombaan', { headers });
  }

  fetchPendaftaranLomba(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get('http://localhost:3000/api/pendaftaran-lomba', { headers });
  }

  fetchCatatanWaktu(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get('http://localhost:3000/api/catatan-waktu-atlet', { headers });
  }
  
}
