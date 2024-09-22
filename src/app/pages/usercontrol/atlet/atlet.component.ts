import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';  // Import SweetAlert2

@Component({
  selector: 'app-atlet',
  templateUrl: './atlet.component.html',
  styleUrls: ['./atlet.component.css']
})
export class AtletComponent implements OnInit {

  atletForm: FormGroup;
  clubs: any[] = [];  // Variabel untuk menyimpan data klub dari API
  atlets: any[] = [];  // Daftar atlet yang akan diambil berdasarkan klub yang dipilih
  kelompokUmurs: any[] = [];  // Variabel untuk menyimpan data kelompok umur dari API
  namaKelompokUmur: string = '';  // Variabel untuk menyimpan nama kelompok umur yang dipilih
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService  // Inject AuthService untuk mengambil token
  ) {
    this.atletForm = this.fb.group({
      nama_atlet: ['', Validators.required],
      asal_klub: ['', Validators.required],
      tanggal_lahir: ['', Validators.required],
      kelompok_umur: ['', Validators.required],  // Tambahkan field untuk kelompok umur
      gender: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllClubs();  // Panggil API untuk mendapatkan semua klub
    this.getAllKelompokUmur();  // Panggil API untuk mendapatkan semua kelompok umur
  }

  onClubChange(event: any) {
    const selectedClubId = event.target.value;
    this.getAtletsByClub(selectedClubId);

  }

  // Mengambil token dari AuthService dan menambahkannya ke header
  getHeaders() {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`  // Masukkan token ke header Authorization
      });
    }
    return new HttpHeaders();  // Kembalikan header kosong jika token tidak ada
  }

  // Mengambil daftar klub dari API
  getAllClubs() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/klubs', { headers }).subscribe(
      (response: any) => {
        this.clubs = response.data;  // Simpan data klub dari response API
      },
      error => {
        console.error('Error loading clubs:', error);  // Tangani error jika API gagal
      }
    );
  }

  // Mengambil daftar kelompok umur dari API
  getAllKelompokUmur() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/kelompok-umur', { headers }).subscribe(
      (response: any) => {
        this.kelompokUmurs = response.data;  // Simpan data kelompok umur dari response API
      },
      error => {
        console.error('Error loading kelompok umur:', error);  // Tangani error jika API gagal
      }
    );
  }

  // Mengambil daftar atlet berdasarkan klub yang dipilih
  getAtletsByClub(idKlub: number) {
    const headers = this.getHeaders();
    console.log('ID Klub:', idKlub);
    this.http.get(`http://localhost:3000/api/atlets/${idKlub}`, { headers }).subscribe(
      (response: any) => {
        this.atlets = response.data;  // Simpan daftar atlet yang diambil berdasarkan klub yang dipilih
        this.atlets.forEach((atlet) => {
          const kelompokUmur = this.kelompokUmurs.find((kelompok) => kelompok.idKelompokUmur === atlet.idKelompokUmur);
          if (kelompokUmur) {
            atlet.namaKelompokUmur = kelompokUmur.namaKelompokUmur;
          }else{
            atlet.namaKelompokUmur = 'Unknown';
          }
        })
      },
      (error) => {
        console.error('Error loading athletes:', error);  // Tangani error jika API gagal
      }
    );
  }

  // Mengirim data form ke backend
  onSubmit() {
    if (this.atletForm.valid) {
      const formData = {
        namaAtlet: this.atletForm.value.nama_atlet,
        idKlub: Number(this.atletForm.value.asal_klub),
        tanggalLahir: this.atletForm.value.tanggal_lahir,
        idKelompokUmur: Number(this.atletForm.value.kelompok_umur),  // Convert to number
        gender: this.atletForm.value.gender
      };

      const headers = this.getHeaders();
      this.http.post('http://localhost:3000/api/atlets', formData, { headers }).subscribe(
        (response: any) => {
          console.log('Data berhasil dikirim:', response);
          Swal.fire({
            title: 'Success!',
            text: 'Data berhasil disimpan.',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          // Setelah data berhasil dikirim, ambil data atlet terbaru
          this.getAtletsByClub(this.atletForm.value.asal_klub);  // Ambil ulang data atlet
        },
        (error) => {
          console.error('Error submitting form:', error);
          let errorMessage = 'Terjadi kesalahan saat mengirim data.';
          if (error.status === 500) {
            errorMessage = 'Internal Server Error. Silakan coba lagi nanti.';
          } else if (error.status === 400) {
            errorMessage = 'Input tidak valid. Periksa kembali form.';
          }

          // Menampilkan error di SweetAlert
          Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    } else {
      Swal.fire({
        title: 'Invalid Form!',
        text: 'Silakan isi semua field yang diperlukan.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }


}
