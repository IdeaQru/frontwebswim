import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jsPDF from 'jspdf';  // Import jsPDF for generating the PDF
import autoTable from 'jspdf-autotable';  // Use jsPDF autoTable plugin for tables
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { IfStmt } from '@angular/compiler';
import { filter } from 'rxjs';

@Component({
  selector: 'app-startinglist',
  templateUrl: './startinglist.component.html',
  styleUrls: ['./startinglist.component.css']
})
export class StartingListComponent implements OnInit {
  clubs: any[] = [];
  atlets: any[] = [];
  selectedClub: any = null;
  pdfUrl: string | null = null;  // URL for the PDF Blob
  kelompokUmurs: any[] = [];  // Variabel untuk menyimpan data kelompok umur dari API
  perlombaans: any[] = [];
  namaPerlombaan: string = '';
  namaKelompokUmur: string = '';
  pendaftaran: any;
  catatanWaktu: any;
  jumlahNomorPendaftaranClub: Number = 0;
  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    this.fetchClubs();
    this.getAllKelompokUmur();
    this.getAllPerlombaans();
    this.getAllCatatanWaktu();
  }

  // Get token and add it to headers
  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Fetch all clubs
  fetchClubs() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/klubs', { headers }).subscribe(
      (response: any) => {
        this.clubs = response.data;
      },
      (error) => {
        console.error('Error fetching clubs:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch clubs. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
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

  getAllPerlombaans() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/perlombaan', { headers }).subscribe(
      (response: any) => {
        this.perlombaans = response.data;
      },
      error => {
        console.error('Error loading perlombaans:', error);
      }
    );
  }
  getAllCatatanWaktu() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/catatan-waktu-atlet', { headers }).subscribe(
      (response: any) => {
        this.catatanWaktu = response.data;
      },
      error => {
        console.error('Error loading catatan waktu:', error);
      }
    );

  }

  // Fetch athletes based on selected club
  onClubSelect(event: any) {
    const selectedClubId = event.target.value;
    const headers = this.getHeaders();

    // Fetch athletes for the selected club
    this.http.get(`http://localhost:3000/api/atlets/${selectedClubId}`, { headers }).subscribe(
      (response: any) => {
        const clubName = this.clubs.find(club => club.idKlub == selectedClubId)?.namaKlub;
        this.selectedClub = {
          namaKlub: clubName,
          athletes: response.data
        };

        // Fetch catatan waktu
        this.http.get('http://localhost:3000/api/catatan-waktu-atlet', { headers }).subscribe(
          (catatanWaktu: any) => {
            const catatanWaktuData = catatanWaktu.data;

            // Fetch pendaftaran data to get registration count for each athlete
            this.http.get('http://localhost:3000/api/pendaftaran-lomba', { headers }).subscribe(
              (pendaftaranResponse: any) => {
                const pendaftaranData = pendaftaranResponse.data;
                let totalRegistrationsClub = 0;
                // Map athletes with their competition details and registration count
                this.selectedClub.athletes.forEach((athlete: any) => {
                  // Get all catatan waktu entries for this athlete
                  athlete.catatanWaktu = catatanWaktuData.filter((cw: any) => cw.idAtlet === athlete.idAtlet);

                  if (this.kelompokUmurs && this.kelompokUmurs.length > 0) {
                    const kelompokUmur = this.kelompokUmurs.find(kelompok => kelompok.idKelompokUmur === athlete.idKelompokUmur);
                    this.namaKelompokUmur = kelompokUmur ? kelompokUmur.namaKelompokUmur : 'Unknown';
                    console.log('Kelompok Umur Name:', this.namaKelompokUmur);
                  } else {
                    console.error('kelompokUmurs is not defined or empty.');
                  }

                  athlete.catatanWaktu.forEach((cw: any, index: number) => {
                    // Find the competition name based on idPerlombaan
                    const perlombaan = this.perlombaans.find(perlombaan => perlombaan.idPerlombaan === cw.idPerlombaan);
                    this.namaPerlombaan = perlombaan ? perlombaan.namaPerlombaan : 'Unknown';
                  });

                  // Find the number of registrations for this athlete
                  const athleteRegistrations = pendaftaranData.filter((pendaftaran: any) => pendaftaran.idAtlet === athlete.idAtlet);
                  athlete.jumlahPendaftaran = athleteRegistrations.length; // Add the count to the athlete object
                  totalRegistrationsClub += athlete.jumlahPendaftaran;

                  console.log(`Athlete: ${athlete.namaAtlet}, Number of Registrations: ${athlete.jumlahPendaftaran}`);
                });
                console.log('Total Registrations for Club:', totalRegistrationsClub);
                this.jumlahNomorPendaftaranClub = totalRegistrationsClub;
                console.log('Selected Athletes with Catatan Waktu and Registrations:', this.selectedClub.athletes);
              },
              (error) => {
                console.error('Error fetching pendaftaran data:', error);
              }
            );
          },
          (error) => {
            console.error('Error fetching catatan waktu:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching athletes for club:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch athletes for the selected club. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }


  // Generate PDF for all clubs
  generatePdfPreview() {
    if (this.selectedClub) {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Kejuaraan 2024', 105, 10, { align: 'center' });
      doc.setFontSize(12);

      // Menampilkan informasi klub, jumlah atlet, dan jumlah pendaftaran
      doc.text(`Club: ${this.selectedClub.namaKlub}`, 10, 10);
      doc.text(`Number of Athletes: ${this.selectedClub.athletes.length}`, 10, 20);

      // Menghitung total pembayaran berdasarkan jumlah pendaftaran dan harga per pendaftaran
      const jumlahNomorPendaftaranClub: any = this.jumlahNomorPendaftaranClub || 0; // Pastikan nilainya tidak undefined atau null
      const hargaPerPendaftaran = 50000; // Harga per pendaftaran

      // Tampilkan jumlah pendaftaran dan hitung total pembayaran
      doc.text(`Number of Registrations: ${jumlahNomorPendaftaranClub}`, 140, 10);
      doc.text(`Must be paying  : Rp.${jumlahNomorPendaftaranClub * hargaPerPendaftaran}`, 140, 20);

      const tableBody: any[] = [];
      let itteration = 1;
      this.selectedClub.athletes.sort((a: any, b: any) => a.gender.localeCompare(b.gender));

      // Loop through each athlete and their catatan waktu
      this.selectedClub.athletes.forEach((athlete: any) => {
        if (athlete.catatanWaktu && athlete.catatanWaktu.length > 0) {
          athlete.catatanWaktu.forEach((cw: any, index: number) => {
            const perlombaan = this.perlombaans.find(p => p.idPerlombaan === cw.idPerlombaan);
            const namaPerlombaan = perlombaan ? perlombaan.namaPerlombaan : 'Unknown';
            const kelompokUmur = this.kelompokUmurs.find(ku => ku.idKelompokUmur === athlete.idKelompokUmur);
            const namaKelompokUmur = kelompokUmur ? kelompokUmur.namaKelompokUmur : 'Unknown';
            const gender =athlete.gender;
            tableBody.push([
              itteration++,
              athlete.namaAtlet,
              new Date(athlete.tanggalLahir).toLocaleDateString('en-GB'),
              gender,
              namaKelompokUmur,         // Age group name
              namaPerlombaan,           // Competition name
              cw.Prelimit,              // Show Prelimit (time)
            ]);
          });
        } else {
          tableBody.push([
            1,
            athlete.namaAtlet,
            new Date(athlete.tanggalLahir).toLocaleDateString('en-GB'),
            'No age group',
            'No competition',
            'No time',
          ]);
        }
      });

      // Use autoTable for better table formatting
      autoTable(doc, {
        head: [['No', 'Athlete Name', 'Date of Birth','Gender', 'Age Group', 'Competition Name', 'Prelimit']],
        body: tableBody,
        startY: 30
      });

      // Convert the generated PDF to a Blob
      const blob = doc.output('blob');

      // Create a URL for the Blob and store it in pdfUrl
      this.pdfUrl = URL.createObjectURL(blob);
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a club before generating the PDF.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }



  generatePdfForAllClubs() {
    const doc = new jsPDF();
    let currentY = 20;
    const totalClubs = this.clubs.length;

    doc.setFontSize(18);
    doc.text('Kejuaraan 2024', 105, 10, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Total Clubs Registered: ${totalClubs}`, 105, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 105, 22, { align: 'center' });

    const headers = this.getHeaders();

    // Use Promise.all to wait for all clubs' data
    const clubPromises = this.clubs.map((club: any) => {
      return this.http.get(`http://localhost:3000/api/atlets/${club.idKlub}`, { headers }).toPromise()
        .then((response: any) => {
          const athletes = response.data;
          return { clubName: club.namaKlub, athletes }; // Return both the club name and athletes
        });
    });

    // When all clubs' data is fetched
    Promise.all(clubPromises).then(clubData => {
      clubData.forEach(({ clubName, athletes }, clubIndex) => {
        // Check if the club has athletes before proceeding
        if (!athletes || athletes.length === 0) {
          console.warn(`No athletes found for club: ${clubName}`);
          return; // Skip this club if no athletes are found
        }

        // Sort athletes by gender: Putra first, then Putri
        athletes.sort((a: any, b: any) => a.gender.localeCompare(b.gender));

        // Add club name and athlete count
        doc.setFontSize(14);
        doc.text(`Club: ${clubName}`, 10, currentY);
        currentY += 8;
        doc.setFontSize(12);
        doc.text(`Number of Athletes: ${athletes.length}`, 10, currentY);
        currentY += 10;
        let itteration = 1;
        const tableBody: any[] = [];

        // Iterate over each athlete and their catatan waktu
        athletes.forEach((athlete: any) => {
          console.log('Athlete:', athlete); // Debugging

          const kelompokUmur = this.kelompokUmurs.find(ku => ku.idKelompokUmur === athlete.idKelompokUmur);
          const namaKelompokUmur = kelompokUmur ? kelompokUmur.namaKelompokUmur : 'Unknown';
          const AtletCatatanWaktu = this.catatanWaktu.filter((cw: any) => cw.idAtlet === athlete.idAtlet);
          if (AtletCatatanWaktu && AtletCatatanWaktu.length > 0) {
            // Iterate over catatan waktu
            AtletCatatanWaktu.forEach((cw: any, index: number) => {
              console.log('Catatan Waktu:', cw); // Debugging

              // Find the competition (perlombaan)
              const perlombaan = this.perlombaans.find(p => p.idPerlombaan === cw.idPerlombaan);
              const namaPerlombaan = perlombaan ? perlombaan.namaPerlombaan : 'Unknown';
              console.log('Perlombaan:', perlombaan); // Debugging

              tableBody.push([
                itteration,
                athlete.namaAtlet,
                new Date(athlete.tanggalLahir).toLocaleDateString('en-GB'),
                namaKelompokUmur,         // Age group name
                athlete.gender,           // Gender of the athlete
                namaPerlombaan,           // Competition name
                cw.Prelimit,              // Show Prelimit (time)
              ]);

              itteration++;
            });
          } else {
            // If no catatan waktu, add a default row for the athlete
            tableBody.push([
              itteration,
              athlete.namaAtlet,
              new Date(athlete.tanggalLahir).toLocaleDateString('en-GB'),
              namaKelompokUmur,
              athlete.gender,           // Gender of the athlete
              'No competition',
              'No time',
            ]);

            itteration++;
          }
        });

        autoTable(doc, {
          head: [['No', 'Athlete Name', 'Date of Birth', 'Age Group', 'Gender', 'Competition Name', 'Prelimit']],
          body: tableBody,
          startY: currentY,
          theme: 'striped',
          headStyles: {
            fillColor: [22, 160, 133],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          margin: { top: 10 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      });

      // After all clubs' data is processed, generate the PDF
      const blob = doc.output('blob');
      this.pdfUrl = URL.createObjectURL(blob);
    })
      .catch(error => {
        console.error('Error fetching clubs data:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch data for all clubs. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
}

}
