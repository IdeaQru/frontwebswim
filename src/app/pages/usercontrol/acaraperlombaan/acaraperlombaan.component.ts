import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-acaraperlombaan',
  templateUrl: './acaraperlombaan.component.html',
  styleUrls: ['./acaraperlombaan.component.css']
})
export class AcaraperlombaanComponent implements OnInit {

  pendaftaranLombaForm: FormGroup;
  clubs: any[] = [];
  atlets: any[] = [];
  perlombaans: any[] = [];
  kelompokUmurs: any[] = [];
  selectedAtlet: any;
  waktuInputsEnabled: boolean[] = [];  // Array untuk mengelola status slider per perlombaan
  selectedClub: any;
  namaKelompokUmur: string = '';
  gender: string = '';
  atletPerlombaans: any[] = [];  // Perlombaan yang relevan untuk atlet yang dipilih

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.pendaftaranLombaForm = this.fb.group({
      asal_klub: ['', Validators.required],
      atlet: ['', Validators.required],
      kelompokUmur: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllClubs();
    this.getAllKelompokUmur();
  }

  getAllClubs() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/klubs', { headers }).subscribe(
      (response: any) => {
        this.clubs = response.data;
      },
      error => {
        console.error('Error loading clubs:', error);
      }
    );
  }

  getAllPerlombaansForAtlet(idKelompokUmurSelected: number,genderSelected : string) {
    console.log('Selected Atlet:', idKelompokUmurSelected);
    const headers = this.getHeaders();
    // Fetch perlombaans based on the selected Atlet
    this.http.get(`http://localhost:3000/api/perlombaan`, { headers }).subscribe(
      (response: any) => {
        console.log('ALLPerlombaans:', response.data);
        this.perlombaans = response.data.filter((perlombaan: any) => {
          console.log('Perlombaan ID:', perlombaan.idKelompokUmur);  // Debug individual perlombaan
          return perlombaan.idKelompokUmur === idKelompokUmurSelected && perlombaan.gender === genderSelected;
        });

        console.log('Filtered Perlombaans:', this.perlombaans);  // Log perlombaans after filtering

        // Tambahkan form controls untuk setiap perlombaan yang relevan
        this.perlombaans.forEach((perlombaan, index) => {
          this.pendaftaranLombaForm.addControl('menit_' + index, new FormControl({ value: '', disabled: true }));
          this.pendaftaranLombaForm.addControl('detik_' + index, new FormControl({ value: '', disabled: true }));
          this.pendaftaranLombaForm.addControl('milidetik_' + index, new FormControl({ value: '', disabled: true }));
          this.waktuInputsEnabled[index] = false;
        });
      },
      error => {
        console.error('Error loading perlombaans for atlet:', error);
      }
    );
  }

  getAllKelompokUmur() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/kelompok-umur', { headers }).subscribe(
      (response: any) => {
        this.kelompokUmurs = response.data;
      },
      error => {
        console.error('Error loading kelompok umurs:', error);
      }
    );
  }

  onClubChange(event: any) {
    const selectedClubId = event.target.value;
    this.getAtletsByClub(selectedClubId);
  }

  getAtletsByClub(idKlub: number) {
    const headers = this.getHeaders();
    this.http.get(`http://localhost:3000/api/atlets/${idKlub}`, { headers }).subscribe(
      (response: any) => {
        this.atlets = response.data;
      },
      error => {
        console.error('Error loading athletes:', error);
      }
    );
  }

  onAtletChange(event: any) {
    const selectedAtletId = event.target.value;
    this.selectedAtlet = this.atlets.find(atlet => atlet.idAtlet === Number(selectedAtletId));

    if (this.selectedAtlet) {
      const kelompokUmur = this.kelompokUmurs.find(kelompok => kelompok.idKelompokUmur === this.selectedAtlet.idKelompokUmur);
      if (kelompokUmur) {
        this.pendaftaranLombaForm.patchValue({
          kelompokUmur: kelompokUmur.idKelompokUmur
        });
        this.namaKelompokUmur = kelompokUmur.namaKelompokUmur;
        this.gender = this.selectedAtlet.gender;
        console.log('Nama Kelompok Umur:', kelompokUmur.namaKelompokUmur);
        this.getAllPerlombaansForAtlet(kelompokUmur.idKelompokUmur,this.gender);
      }
      // Ambil perlombaan yang relevan untuk atlet yang dipilih
    }
  }

  toggleWaktuInput(index: number) {
    this.waktuInputsEnabled[index] = !this.waktuInputsEnabled[index];
    const isEnabled = this.waktuInputsEnabled[index];

    if (isEnabled) {
      this.pendaftaranLombaForm.controls['menit_' + index].enable({ onlySelf: true });
      this.pendaftaranLombaForm.controls['detik_' + index].enable({ onlySelf: true });
      this.pendaftaranLombaForm.controls['milidetik_' + index].enable({ onlySelf: true });
    } else {
      this.pendaftaranLombaForm.controls['menit_' + index].disable({ onlySelf: true });
      this.pendaftaranLombaForm.controls['detik_' + index].disable({ onlySelf: true });
      this.pendaftaranLombaForm.controls['milidetik_' + index].disable({ onlySelf: true });
    }
  }

  onSubmit() {
    if (this.pendaftaranLombaForm.valid) {
      const idAtlet = Number(this.pendaftaranLombaForm.value.atlet);
      const idKelompokUmur = Number(this.pendaftaranLombaForm.value.kelompokUmur);
      const headers = this.getHeaders();

      const activeSliders = this.perlombaans.filter((_, index) => this.waktuInputsEnabled[index]);

      if (activeSliders.length > 0) {
        const pendaftaranPromises = activeSliders.map((perlombaan, index) => {
          const pendaftaranData = {
            idAtlet: idAtlet,
            idPerlombaan: Number(perlombaan.idPerlombaan),
            idKelompokUmur: idKelompokUmur
          };

          return this.http.post('http://localhost:3000/api/pendaftaran-lomba', pendaftaranData, { headers }).toPromise()
            .then((pendaftaranResponse: any) => {
              const catatanWaktuData = {
                idAtlet: idAtlet,
                idPerlombaan: Number(perlombaan.idPerlombaan),
                Prelimit: {
                  menit: Number(this.pendaftaranLombaForm.value[`menit_${index}`] || 0),
                  detik: Number(this.pendaftaranLombaForm.value[`detik_${index}`] || 0),
                  milidetik: Number(this.pendaftaranLombaForm.value[`milidetik_${index}`] || 0)
                },
                idPendaftaran: pendaftaranResponse.data.idPendaftaran
              };

              return this.http.post('http://localhost:3000/api/catatan-waktu-atlet', catatanWaktuData, { headers }).toPromise();
            });
        });

        Promise.all(pendaftaranPromises)
          .then(() => {
            Swal.fire({
              title: 'Success!',
              text: 'Pendaftaran dan catatan waktu berhasil disimpan.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          })
          .catch((error) => {
            console.error('Error submitting pendaftaran or catatan waktu:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Terjadi kesalahan saat menyimpan pendaftaran atau catatan waktu.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          });
      } else {
        Swal.fire({
          title: 'Warning!',
          text: 'Tidak ada perlombaan yang dipilih.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
    }
  }

  getHeaders() {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return new HttpHeaders();
  }
  formatTime(event: any, controlNamePrefix: string, index: number) {
    let value = event.target.value;

    // Ensure the value is between 0-99 or appropriate range for detik/milidetik
    const minValue = 0;
    let maxValue = 99;

    if (controlNamePrefix === 'detik_') {
      maxValue = 60;
    } else if (controlNamePrefix === 'milidetik_') {
      maxValue = 99;
    }

    // Constrain the value to min/max
    if (value < minValue) {
      value = minValue;
    } else if (value > maxValue) {
      value = maxValue;
    }

    // Pad single-digit numbers with 0
    if (value < 10) {
      value = '0' + value;
    }

    // Set the formatted value back into the form control
    this.pendaftaranLombaForm.get(controlNamePrefix + index)?.setValue(value);
  }

}
