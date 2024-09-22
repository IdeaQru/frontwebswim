import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { HasilLombaService } from 'src/app/services/hasil-lomba.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  perlombaans: any[] = [];  // Daftar perlombaan dari API
  kelompokUmurs: any[] = []; // Daftar kelompok umur dari API
  hasilLomba: any[] = [];   // Data hasil lomba yang diambil dari API
  atlets: any[] = [];       // Data atlet dari API
  catatanWaktu: any[] = []; // Data catatan waktu dari API
  klubs: any[] = [];        // Data klub dari API
  constructor(
    private hasilLombaService: HasilLombaService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private http : HttpClient  // Import sanitizer for safe blob URL usage
  ) {}
  ngOnInit(): void {
    this.fetchKelompokUmurData();
    this.fetchPerlombaanData();
    this.fetchAtletData();
    this.fetchCatatanWaktu();
    this.fetchKlubData();  // Fetch club data from API
  }

  // Fungsi untuk mendapatkan header autentikasi
  getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Mengambil token dari layanan Auth
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Fungsi untuk mendapatkan daftar perlombaan dari API
  fetchPerlombaanData() {
    const headers = this.getHeaders();
    this.hasilLombaService.getPerlombaan(headers).subscribe(
      (response: any) => {
        this.perlombaans = response.data.map((perlombaan: any) => {
          const kelompokUmur = this.kelompokUmurs.find(ku => ku.idKelompokUmur === perlombaan.idKelompokUmur);
          return {
            ...perlombaan,
            namaKelompokUmur: kelompokUmur ? kelompokUmur.namaKelompokUmur : 'Unknown'  // Tambahkan nama kelompok umur berdasarkan id
          };
        });
      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch perlombaan.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  // Fungsi untuk mendapatkan daftar kelompok umur dari API
  fetchKelompokUmurData() {
    const headers = this.getHeaders();
    this.hasilLombaService.getKelompokUmur(headers).subscribe(
      (response: any) => {
        this.kelompokUmurs = response.data;  // Simpan data kelompok umur dari API
      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch kelompok umur.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  // Fungsi untuk mendapatkan daftar atlet dari API
  fetchAtletData() {
    const headers = this.getHeaders();
    this.hasilLombaService.getAtlets(headers).subscribe(
      (response: any) => {
        this.atlets = response.data;
      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch atlet data.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  // Fungsi untuk mendapatkan daftar klub dari API
  fetchKlubData() {
    const headers = this.getHeaders();
    this.hasilLombaService.getKlubs(headers).subscribe(
      (response: any) => {
        this.klubs = response.data;  // Simpan data klub dari API
      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch club data.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  // Fungsi untuk mendapatkan catatan waktu dari API
  fetchCatatanWaktu() {
    const headers = this.getHeaders();
    this.hasilLombaService.getCatatanWaktu(headers).subscribe(
      (response: any) => {
        this.catatanWaktu = response.data;
      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch catatan waktu.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }
}
