import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HasilLombaService {
  private apiUrl = 'http://localhost:3000/api/';  // URL dasar API Anda

  constructor(private http: HttpClient) { }

  // Fungsi untuk mengambil daftar perlombaan dari API
  getPerlombaan(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}perlombaan`, { headers });
  }

  // Fungsi untuk mengambil hasil lomba berdasarkan idPerlombaan dan headers
  getHasilLomba(perlombaanId: number, headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}hasil-lomba?perlombaanId=${perlombaanId}`, { headers });
  }
  getAtlets(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}atlets`, { headers });
  }
  getCatatanWaktu(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}catatan-waktu-atlet`, { headers });
  }
  getKelompokUmur(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}kelompok-umur`, { headers });
  }
  getAllHasilLomba(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}all-hasil-lomba`, { headers });  // Mengambil semua hasil lomba
  }
  getKlubs(headers: HttpHeaders): Observable<any> {
    return this.http.get(`${this.apiUrl}klubs`, { headers });  // Mengambil semua hasil lomba
  }

}
