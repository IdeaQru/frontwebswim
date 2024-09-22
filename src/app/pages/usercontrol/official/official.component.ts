import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-official',
  templateUrl: './official.component.html',
  styleUrls: ['./official.component.css']
})
export class OfficialComponent implements OnInit {
  officialForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.officialForm = this.fb.group({
      nama: ['', Validators.required],
      asal_sekolah_klub: ['', Validators.required],
      nomor_handphone: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.officialForm.valid) {
      const officialData = this.officialForm.value;
      const klubData = {
        namaKlub: officialData.asal_sekolah_klub
      };

      const token = this.authService.getToken();
      if (token) {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        // Kirim data klub terlebih dahulu
        this.http.post('http://localhost:3000/api/klubs', klubData, { headers }).subscribe(
          (klubResponse: any) => {
            const idKlub = klubResponse.data.idKlub;

            // Kirim data official dengan idKlub
            const officialPayload = {
              nama: officialData.nama,
              nomorTelepon: officialData.nomor_handphone,
              idKlub: idKlub
            };

            this.http.post('http://localhost:3000/api/officials', officialPayload, { headers }).subscribe(
              officialResponse => {
                Swal.fire({
                  title: 'Success!',
                  text: 'Official and Club successfully registered.',
                  icon: 'success',
                  confirmButtonText: 'OK'
                });
              },
              error => {
                Swal.fire({
                  title: 'Error!',
                  text: 'Error saving official data. Please try again.',
                  icon: 'error',
                  confirmButtonText: 'OK'
                });
                console.error('Error saving official data:', error);
              }
            );
          },
          error => {
            if (error.status === 409) {  // 409 Conflict - Duplicate club name
              Swal.fire({
                title: 'Duplicate Club!',
                text: 'Club name already exists. Please choose a different name.',
                icon: 'warning',
                confirmButtonText: 'OK'
              });
            } else {
              Swal.fire({
                title: 'Error!',
                text: 'Error saving club data. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
            console.error('Error saving klub data:', error);
          }
        );
      } else {
        Swal.fire({
          title: 'Unauthorized!',
          text: 'User is not logged in or token is missing.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
    } else {
      Swal.fire({
        title: 'Invalid Form!',
        text: 'Please fill out all required fields correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }
}
