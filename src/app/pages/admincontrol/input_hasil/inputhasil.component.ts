import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { parsePrelimit } from 'src/app/utils/time-utils';
import { SeriesLaneService } from 'src/app/services/series-lane.service';

@Component({
  selector: 'app-inputhasil',
  templateUrl: './inputhasil.component.html',
  styleUrls: ['./inputhasil.component.css']
})
export class InputhasilComponent implements OnInit {

  atlets: any[] = [];
  kelompokUmurs: any[] = [];
  perlombaans: any[] = [];
  pendaftaranLomba: any[] = [];
  catatanWaktu: any[] = [];
  filteredAtlets: any[] = []; // Atlet yang akan ditampilkan setelah memilih perlombaan
  selectedPerlombaan: string = ''; // ID perlombaan yang dipilih
  bukuHasil: any[] = [];
  selectedKelompokUmur: any;
  existingResults: any[] = []; // Store the existing results here
  seriesLanes: any[] = []; // Atlet yang telah diberi seri dan lintasan

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private seriesLaneService: SeriesLaneService // Inject SeriesLaneService
  ) {}

  ngOnInit(): void {
    this.fetchAtletData();
    this.fetchKelompokUmurData();
    this.fetchPerlombaanData();
    this.fetchPendaftaranLomba();
    this.fetchCatatanWaktu();
  }

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  fetchAtletData() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/atlets', { headers }).subscribe(
      (response: any) => { this.atlets = response.data;  },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch atlets.', icon: 'error' }); }
    );
  }

  fetchKelompokUmurData() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/kelompok-umur', { headers }).subscribe(
      (response: any) => { this.kelompokUmurs = response.data; },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch kelompok umur.', icon: 'error' }); }
    );
  }

  fetchPerlombaanData() {
    const headers = this.getHeaders();

    // Ambil data perlombaan dari API
    this.http.get('http://localhost:3000/api/perlombaan', { headers }).subscribe(
      (response: any) => {
        // Setelah data perlombaan diambil, tambahkan namaKelompokUmur dengan mencocokkan idKelompokUmur
        this.perlombaans = response.data.map((perlombaan: { idKelompokUmur: any; }) => {
          // Cari nama kelompok umur berdasarkan idKelompokUmur
          const kelompokUmur = this.kelompokUmurs.find(k => k.idKelompokUmur === perlombaan.idKelompokUmur);
          // Tambahkan namaKelompokUmur ke setiap perlombaan
          return {
            ...perlombaan,
            namaKelompokUmur: kelompokUmur ? kelompokUmur.namaKelompokUmur : 'Unknown'
          };
        });
      },
      (error) => {
        // Tangani error jika terjadi
        Swal.fire({ title: 'Error!', text: 'Failed to fetch perlombaan.', icon: 'error' });
      }
    );
  }

  fetchPendaftaranLomba() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/pendaftaran-lomba', { headers }).subscribe(
      (response: any) => { this.pendaftaranLomba = response.data; },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch pendaftaran lomba.', icon: 'error' }); }
    );
  }

  fetchCatatanWaktu() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/catatan-waktu-atlet', { headers }).subscribe(
      (response: any) => { this.catatanWaktu = response.data;  },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch catatan waktu.', icon: 'error' }); }
    );
  }
  validateTime(atlet: any) {
    const timePattern = /^(\d{1,2}):([0-5][0-9]):([0-9]{1,3})$/; // Format MM:SS:MS
    const result = atlet.result.trim();  // Hilangkan spasi kosong

    // Cek apakah input adalah waktu, DQ, atau NS
    if ((!timePattern.test(result)) && result !== 'DQ' && result !== 'NS') {
      Swal.fire({
        title: 'Invalid Format!',
        text: 'Please enter time in MM:SS:MS format, or select DQ/NS.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      atlet.result = ''; // Hapus hasil jika formatnya salah
      return false; // Return false jika tidak valid
    }

    return true; // Jika validasi berhasil
  }
  fetchExistingResults() {
    const headers = this.getHeaders();
    this.http.get(`http://localhost:3000/api/hasil-lomba?perlombaanId=${this.selectedPerlombaan}`, { headers }).subscribe(
      (response: any) => {
        this.existingResults = response.data;
        this.populateAtletWithResults();
      },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch existing results.', icon: 'error' }); }
    );
  }

  populateAtletWithResults() {
    this.filteredAtlets.forEach(atlet => {
      const existingResult = this.existingResults.find(result => result.idAtlet === atlet.idAtlet);
      if (existingResult) {
        // If result exists, populate the atlet with existing result data
        atlet.result = existingResult.result;
        atlet.posisi = existingResult.posisi;
      }
    });
  }

  onPerlombaanSelect() {
    if (!this.selectedPerlombaan) {
      this.filteredAtlets = [];
      return;
    }

    // Filter atlet untuk perlombaan yang dipilih
    const pendaftaranForPerlombaan = this.pendaftaranLomba.filter(pendaftaran => pendaftaran.idPerlombaan === parseInt(this.selectedPerlombaan));

    // Pastikan pendaftaranForPerlombaan tidak kosong
    if (pendaftaranForPerlombaan.length === 0) {
      Swal.fire({
        title: 'No Data',
        text: 'No athletes found for the selected event.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      this.filteredAtlets = [];
      return;
    }

    // Mapping atlet yang relevan
    this.filteredAtlets = pendaftaranForPerlombaan.map((pendaftaran) => {
      const atlet = this.atlets.find(a => a.idAtlet === pendaftaran.idAtlet);
      const catatanWaktuAtlet = this.catatanWaktu.find(cw => cw.idAtlet === atlet.idAtlet && cw.idPerlombaan === pendaftaran.idPerlombaan);
      const prelimit = catatanWaktuAtlet ? parsePrelimit(catatanWaktuAtlet.Prelimit) : 'No time recorded';

      return {
        ...atlet,
        prelimit,
        idPendaftaran: pendaftaran.idPendaftaran,
        editing: false,
        result: '' // Ini untuk menyimpan hasil input user nantinya
      };
    });

    // Assign series and lanes dynamically using SeriesLaneService
    this.seriesLanes = this.seriesLaneService.assignSeriesAndLanes(this.filteredAtlets);

    // Display the athletes in the correct series and lanes
    console.log(this.seriesLanes);
    this.fetchExistingResults();

  }


  calculatePositions() {
    // Sort athletes based on their results (time) from fastest to slowest
    this.filteredAtlets.sort((a, b) => {
      if (a.result === 'DQ' || a.result === 'NS') return 1;  // Push 'DQ' and 'NS' to the bottom
      if (b.result === 'DQ' || b.result === 'NS') return -1;

      const timeA = a.result.split(':').map(Number);  // Convert MM:SS:MS format to an array of numbers
      const timeB = b.result.split(':').map(Number);

      const totalA = (timeA[0] * 60000) + (timeA[1] * 1000) + timeA[2]; // Convert result A to milliseconds
      const totalB = (timeB[0] * 60000) + (timeB[1] * 1000) + timeB[2]; // Convert result B to milliseconds

      return totalA - totalB;  // Sort by the fastest time
    });

    let currentPosition = 1;  // Start position
    let previousTime = '';    // Track previous time to check for duplicates
    let tiedPosition = false; // Track if the previous position was tied

    this.filteredAtlets.forEach((atlet, index) => {
      const time = atlet.result;

      if (time === 'DQ' || time === 'NS') {
        // Assign the last position for 'DQ' or 'NS'
        atlet.posisi = this.filteredAtlets.length;
      } else if (time === previousTime) {
        // If the result is the same as the previous one, assign the same position
        atlet.posisi = currentPosition - 1; // Assign the same position as the previous one
        tiedPosition = true;  // Mark that the previous position was tied
      } else {
        // Assign a new position
        if (tiedPosition) {
          // If the previous position was tied, increment the position normally
          currentPosition++;
          tiedPosition = false; // Reset tiedPosition after assigning a new one
        }
        atlet.posisi = currentPosition;
        currentPosition++;  // Increment the position
      }

      // Update the previousTime to the current time
      previousTime = time;
    });

    console.log('Atlet with positions:', this.filteredAtlets);  // Debugging
  }



  onEdit(atlet: any) {
    atlet.editing = true; // Set atlet dalam mode edit
    console.log(`Editing atlet: ${atlet.idAtlet}`, atlet); // Debugging: periksa status editing
  }

  onSave(atlet: any) {
    // Validasi hasil: harus waktu yang valid atau DQ/NS
    if (this.validateTime(atlet)) {
      // Jika hasil valid, keluar dari mode edit dan simpan
      atlet.editing = false;

      // Jika result adalah DQ atau NS, kita tetap lanjutkan proses save
      if (atlet.result === 'DQ' || atlet.result === 'NS') {
        console.log(`Atlet ${atlet.namaAtlet} didiskualifikasi (DQ) atau tidak hadir (NS).`);
        // Tambahkan logika untuk menyimpan hasil DQ/NS di sini
      } else {
        // Jika hasilnya adalah waktu, simpan waktu tersebut
        console.log(`Atlet ${atlet.namaAtlet} menyelesaikan lomba dengan waktu: ${atlet.result}`);
        // Tambahkan logika untuk menyimpan waktu di sini
      }
    }
  }



  submitPerlombaan() {
    this.calculatePositions();
    // Dapatkan atlet yang belum menyimpan hasil
    const unsavedAtlets = this.filteredAtlets.filter(atlet => !atlet.editing);
    console.log('Unsaved Atlets:', unsavedAtlets); // Debugging: Lihat siapa yang belum menyimpan
    if (unsavedAtlets.length === 0) {
      Swal.fire({
        title: 'Error!',
        text: 'No unsaved results to submit.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Proses pengiriman data untuk setiap atlet yang belum menyimpan
    const promises = unsavedAtlets.map(atlet => {
      // Siapkan data yang akan dikirim
      const data = {
        idAtlet: atlet.idAtlet,
        idPerlombaan: Number(this.selectedPerlombaan), // Pastikan ini number
        posisi: atlet.posisi,  // Pastikan posisi dikirim jika ada
        result: atlet.result
      };

      console.log("Data yang dikirim ke backend:", data); // Debugging
      return this.http.post('http://localhost:3000/api/hasil-lomba', data, { headers: this.getHeaders() }).toPromise();
    });
    console.log(promises);

    // Gunakan Promise.all untuk mengirim data secara paralel
    Promise.all(promises)
      .then(() => {
        Swal.fire({
          title: 'Success',
          text: 'All unsaved results have been submitted successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      })
      .catch(error => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to submit some results. Please try again.',
          icon: 'error'
        });
        console.error('Error submitting results:', error);
      });
  }



}
