import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nomorperlombaan',
  templateUrl: './nomorperlombaan.component.html',
  styleUrls: ['./nomorperlombaan.component.css']
})
export class NomorperlombaanComponent {

  perlombaanForm: FormGroup;


  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService) {
    this.perlombaanForm = this.fb.group({
      namaPerlombaan: ['', Validators.required],
      batasWaktu: ['', [Validators.required, Validators.min(1)]],
      namaKelompokUmur: ['', Validators.required] ,// Field untuk nama kelompok umur baru
      gender: ['', Validators.required],
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.perlombaanForm.valid) {
      const formData = this.perlombaanForm.value;
      const token = this.authService.getToken();
      if (token) {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        // Pertama, kirim data ke tabel kelompok umur
        this.http.post('http://localhost:3000/api/kelompok-umur', { namaKelompokUmur: formData.namaKelompokUmur }, { headers }).subscribe(
          (kelompokUmurResponse: any) => {
            const idKelompokUmur = kelompokUmurResponse.data.idKelompokUmur;  // Ambil idKelompokUmur yang baru dibuat

            // Setelah itu, kirim data ke tabel perlombaan dengan idKelompokUmur
            const perlombaanPayload = {
              namaPerlombaan: formData.namaPerlombaan,
              batasWaktu: formData.batasWaktu,
              gender: formData.gender,
              idKelompokUmur: idKelompokUmur  // Gunakan idKelompokUmur yang baru dibuat
            };
            console.log('Perlombaan Payload:', perlombaanPayload);  // Log payload sebelum dikirim

            this.http.post('http://localhost:3000/api/perlombaan', perlombaanPayload, { headers }).subscribe(
              perlombaanResponse => {
                Swal.fire({
                  title: 'Success!',
                  text: 'Perlombaan dan Kelompok Umur berhasil didaftarkan.',
                  icon: 'success',
                  confirmButtonText: 'OK'
                });
              },
              error => {
                Swal.fire({
                  title: 'Error!',
                  text: 'Terjadi kesalahan saat mendaftarkan perlombaan.',
                  icon: 'error',
                  confirmButtonText: 'OK'
                });
              }
            );
          },
          error => {
            Swal.fire({
              title: 'Error!',
              text: 'Terjadi kesalahan saat mendaftarkan kelompok umur.',
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
}
