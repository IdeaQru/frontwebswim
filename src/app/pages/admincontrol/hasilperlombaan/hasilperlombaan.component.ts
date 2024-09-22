import { Component, OnInit } from '@angular/core';
import { HasilLombaService } from 'src/app/services/hasil-lomba.service';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-hasilperlombaan',
  templateUrl: './hasilperlombaan.component.html',
  styleUrls: ['./hasilperlombaan.component.css']
})
export class HasilperlombaanComponent implements OnInit {

  perlombaans: any[] = [];  // Daftar perlombaan dari API
  kelompokUmurs: any[] = []; // Daftar kelompok umur dari API
  hasilLomba: any[] = [];   // Data hasil lomba yang diambil dari API
  atlets: any[] = [];       // Data atlet dari API
  catatanWaktu: any[] = []; // Data catatan waktu dari API
  klubs: any[] = [];        // Data klub dari API
  selectedPerlombaan: number = 0;  // ID perlombaan yang dipilih
  pdfUrl: SafeResourceUrl | null = null; // For storing blob URL of the generated PDF
  textSettings = {
    namaAtlet: { size: 80, x: 870, y: 580 },
    posisi: { size: 60, x: 870, y: 800 },
    result: { size: 30, x: 1310, y: 970 },
    namaKlub: { size: 40, x: 800, y: 630 },
    namaLomba: { size: 30, x: 850, y: 918  },
    namaKelompokUmur: { size: 30, x: 850, y: 970 },
    gender: { size: 30, x: 1310, y: 918 },
  };
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

  onClickLihatHasil() {
    if (this.selectedPerlombaan) {
      const headers = this.getHeaders();
      this.hasilLombaService.getHasilLomba(this.selectedPerlombaan, headers).subscribe(
        (response: any) => {
          this.hasilLomba = this.matchAtletKlubAndPrelimit(response.data);
          console.log('Hasil Lomba:', this.hasilLomba);
          this.generatePdf(false);  // Generate PDF for single event
        },
        (error) => {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to fetch hasil lomba.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a competition first.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  // Fungsi untuk mengambil hasil lomba dari semua event
  onClickLihatSemuaHasil() {
    const headers = this.getHeaders();
    this.hasilLombaService.getAllHasilLomba(headers).subscribe(
      (response: any) => {
        this.hasilLomba = this.matchAtletKlubAndPrelimit(response.data);
        this.generatePdf(true);  // Generate PDF for all events
      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch all event results.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  // Fungsi untuk mencocokkan atlet, klub, dan prelimit dengan hasil lomba berdasarkan idAtlet dan idPerlombaan
  matchAtletKlubAndPrelimit(hasilLomba: any[]): any[] {
    return hasilLomba.map((hasil: any) => {
      const atlet = this.atlets.find(a => a.idAtlet === hasil.idAtlet);
      const catatanWaktu = this.catatanWaktu.find(cw => cw.idAtlet === hasil.idAtlet && cw.idPerlombaan === hasil.idPerlombaan);
      const klub = this.klubs.find(k => k.idKlub === atlet?.idKlub);  // Find the club based on idKlub from athlete data
      return {
        ...hasil,
        namaAtlet: atlet ? atlet.namaAtlet : 'Unknown',
        namaKlub: klub ? klub.namaKlub : 'Unknown',  // Add club name
        tanggalLahir: atlet ? atlet.tanggalLahir : 'Unknown',
        prelimit: catatanWaktu ? catatanWaktu.Prelimit : 'No time recorded' , // Mengambil prelimit
        result: hasil.result  // Ambil result dari hasil lomba

      };
    });
  }

  generateCertificate() {
    if (!this.hasilLomba || this.hasilLomba.length === 0) {
      Swal.fire({
        title: 'Error!',
        text: 'No results available to generate certificates.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const img = new Image();
    img.src = '../../../assets/images/piagam.png'; // Path ke template sertifikat di folder assets
    img.onload = () => {
      const previewCanvas = <HTMLCanvasElement>document.getElementById('certificate-preview');
      const ctx = previewCanvas.getContext('2d');

      if (ctx) {
        previewCanvas.width = img.width;
        previewCanvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Sort the results by 'result' (smallest to largest) and take the top 1 athlete for preview
        const firstPlaceWinner = this.hasilLomba
          .filter(h => h.result !== 'NS' && h.result !== 'DQ') // Exclude 'No Swim' and 'Disqualified'
          .sort((a, b) => parseFloat(a.result) - parseFloat(b.result))[0]; // Get first-place athlete

        // Get the selected competition details
        const selectedPerlombaanDetails = this.perlombaans.find(
          perlombaan => perlombaan.idPerlombaan === Number(this.selectedPerlombaan)
        );

        // Display competition details
        if (selectedPerlombaanDetails) {
          // Competition Name
          ctx.font = `${this.textSettings.namaLomba.size}px Arial`;
          ctx.fillText(selectedPerlombaanDetails.namaPerlombaan, this.textSettings.namaLomba.x, this.textSettings.namaLomba.y);

          // Kelompok Umur
          ctx.font = `${this.textSettings.namaKelompokUmur.size}px Arial`;
          ctx.fillText(selectedPerlombaanDetails.namaKelompokUmur, this.textSettings.namaKelompokUmur.x, this.textSettings.namaKelompokUmur.y);

          // Gender
          ctx.font = `${this.textSettings.gender.size}px Arial`;
          ctx.fillText(selectedPerlombaanDetails.gender, this.textSettings.gender.x, this.textSettings.gender.y);
        }

        // Nama Atlet
        ctx.font = `${this.textSettings.namaAtlet.size}px Arial`;
        ctx.fillText(firstPlaceWinner.namaAtlet, this.textSettings.namaAtlet.x, this.textSettings.namaAtlet.y);

        // Posisi Juara
        ctx.font = `${this.textSettings.posisi.size}px Arial`;
        ctx.fillText(`Juara: ${firstPlaceWinner.posisi}`, this.textSettings.posisi.x, this.textSettings.posisi.y);

        // Limit Waktu
        ctx.font = `${this.textSettings.result.size}px Arial`;
        ctx.fillText(` ${firstPlaceWinner.result}`, this.textSettings.result.x, this.textSettings.result.y);

        // Nama Klub
        ctx.font = `${this.textSettings.namaKlub.size}px Arial`;
        ctx.fillText(`Asal: ${firstPlaceWinner.namaKlub}`, this.textSettings.namaKlub.x, this.textSettings.namaKlub.y);

        // Make the preview section visible
        document.getElementById('preview-section')!.style.display = 'block';
      }
    };
  }



  downloadWinnerCertificateAsPdf() {
    if (!this.hasilLomba || this.hasilLomba.length === 0) {
      Swal.fire({
        title: 'Error!',
        text: 'No results available to generate certificates.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const img = new Image();
    img.src = '../../../assets/images/piagam.png'; // Correct path to the certificate template
    img.onload = () => {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [img.width, img.height] });
      const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width
      const centerX = pageWidth / 2; // Calculate center position

      // Select the top 3 winners based on their position (including positions with asterisks)
      const topWinners = this.hasilLomba
        .filter(h => {
          const pos = h.posisi.toString().replace('*', ''); // Remove the asterisk from the position
          return pos >= 1 && pos <= 3; // Check if position is between 1 and 3
        })
        .sort((a, b) => {
          const posA = parseInt(a.posisi.toString().replace('*', ''), 10); // Remove asterisks and convert to integer
          const posB = parseInt(b.posisi.toString().replace('*', ''), 10); // Remove asterisks and convert to integer
          return posA - posB; // Sort by position
        });

      // Check if there are no valid winners
      if (topWinners.length === 0) {
        Swal.fire({
          title: 'Error!',
          text: 'No winners to generate certificates for.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Get selected competition details
      const selectedPerlombaanDetails = this.perlombaans.find(
        perlombaan => perlombaan.idPerlombaan === Number(this.selectedPerlombaan)
      );

      // Define the file name using the format "Nama Perlombaan - KU Gender"
      let fileName = 'Certificate.pdf';
      if (selectedPerlombaanDetails) {
        fileName = `Piagam Juara - ${selectedPerlombaanDetails.namaPerlombaan} - ${selectedPerlombaanDetails.namaKelompokUmur} ${selectedPerlombaanDetails.gender}.pdf`;
      }

      // Loop through the top winners and generate a certificate for each
      topWinners.forEach((winner, index) => {
        if (index > 0) {
          doc.addPage(); // Add a new page for each athlete after the first one
        }

        // Draw the certificate image on the PDF
        doc.addImage(img, 'PNG', 0, 0, img.width, img.height);

        // Add competition details to each page and center-align them
        if (selectedPerlombaanDetails) {
          doc.setFontSize(this.textSettings.namaLomba.size);
          doc.text(selectedPerlombaanDetails.namaPerlombaan, this.textSettings.namaLomba.x, this.textSettings.namaLomba.y);

          // Kelompok Umur
          doc.setFontSize(this.textSettings.namaKelompokUmur.size);
          doc.text(` ${selectedPerlombaanDetails.namaKelompokUmur}`, this.textSettings.namaKelompokUmur.x, this.textSettings.namaKelompokUmur.y);

          // Gender
          doc.setFontSize(this.textSettings.gender.size);
          doc.text(`${selectedPerlombaanDetails.gender}`, this.textSettings.gender.x, this.textSettings.gender.y);
        }

        // Remove the asterisk from the position when displaying it
        const displayPosition = winner.posisi.toString().replace('*', '');

        // Add athlete details to the certificate and center-align them
        doc.setFontSize(this.textSettings.namaAtlet.size);
        doc.text(winner.namaAtlet, centerX, this.textSettings.namaAtlet.y, { align: 'center' });

        doc.setFontSize(this.textSettings.posisi.size);
        doc.text(`Juara: ${displayPosition}`, centerX, this.textSettings.posisi.y, { align: 'center' });

        doc.setFontSize(this.textSettings.result.size);
        doc.text(`${winner.result}`, this.textSettings.result.x, this.textSettings.result.y);

        doc.setFontSize(this.textSettings.namaKlub.size);
        doc.text(`Asal : ${winner.namaKlub}`, centerX, this.textSettings.namaKlub.y, { align: 'center' });
      });

      // Save the PDF with the custom filename
      doc.save(fileName);
    };
  }







  // Save the current text settings for future use
  saveTextSettings() {
    localStorage.setItem('textSettings', JSON.stringify(this.textSettings));
    Swal.fire('Saved!', 'Text settings have been saved.', 'success');
  }

  // Load saved text settings
  loadTextSettings() {
    const savedSettings = localStorage.getItem('textSettings');
    if (savedSettings) {
      this.textSettings = JSON.parse(savedSettings);
      Swal.fire('Loaded!', 'Text settings have been loaded.', 'success');
    }
  }



  // Fungsi untuk generate PDF dari hasil lomba
  generatePdf(isAllEvents: boolean = false) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    const centerX = pageWidth / 2; // Calculate center X for aligning text

    // Add a title for the document


    let startY = 25; // Initial Y position

    // Loop through each event if generating for all events
    const eventsToGenerate = isAllEvents ? this.perlombaans : [this.selectedPerlombaan];

    eventsToGenerate.forEach((event, eventIndex) => {
        // Check if we need to add a new page before this event
        if (doc.internal.pageSize.height - startY < 40) {
            doc.addPage();
            startY = 25; // Reset startY for the new page
        }

        // Find the competition details
        const selectedPerlombaanDetails = this.perlombaans.find(
            perlombaan => perlombaan.idPerlombaan === (isAllEvents ? event.idPerlombaan : Number(this.selectedPerlombaan))
        );

        if (selectedPerlombaanDetails) {
            // Ensure we don't split the event header and table across pages
            if (doc.internal.pageSize.height - startY < 40) {
                doc.addPage();
                startY = 25;
            }
            const title = isAllEvents ? 'Hasil Semua Perlombaan' : 'Hasil Perlombaan';
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(title, centerX, 15, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            // Add competition details to the PDF
            doc.text(`Perlombaan: ${selectedPerlombaanDetails.namaPerlombaan}`, centerX, startY, { align: 'center' });
            doc.text(`Kelompok Umur: ${selectedPerlombaanDetails.namaKelompokUmur}`, centerX, startY + 6, { align: 'center' });
            doc.text(`${selectedPerlombaanDetails.gender}`, centerX, startY + 12, { align: 'center' });

            // Add a line separator
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 0, 0);
            doc.line(20, startY + 18, pageWidth - 20, startY + 18); // Draw a thin line

            startY += 25; // Adjust startY for content below the header

            // Filter and sort results for the current competition
            const resultsForEvent = this.hasilLomba.filter(hasil => hasil.idPerlombaan === selectedPerlombaanDetails.idPerlombaan);

            const sortedResults = resultsForEvent.sort((a, b) => {
                if (a.result === 'NS') return 1;
                if (b.result === 'NS') return -1;
                if (a.result === 'DQ') return 1;
                if (b.result === 'DQ') return -1;
                return a.posisi - b.posisi;
            });

            let previousResult: { result: any; posisi: any } | null = null;
            let currentPosisi = 0; // Tracks the current position

            // Handle duplicate positions for the same result
            sortedResults.forEach((hasil, index) => {
                if (hasil.result === 'NS' || hasil.result === 'DQ') {
                    hasil.posisi = '-'; // Set position as '-' for NS or DQ
                } else if (previousResult && hasil.result === previousResult.result) {
                    hasil.posisi = `*${previousResult.posisi}`;
                    sortedResults[index - 1].posisi = `*${sortedResults[index - 1].posisi}`;
                } else {
                    currentPosisi += 1; // Increment the position
                    hasil.posisi = currentPosisi; // Assign new position
                }
                previousResult = { result: hasil.result, posisi: hasil.posisi };
            });

            // Add table with results
            autoTable(doc, {
                head: [['Posisi', 'Nama Atlet', 'Nama Klub', 'Tanggal Lahir', 'Prelimit', 'Result']],
                body: sortedResults.map(hasil => [
                    (hasil.result === 'DQ' || hasil.result === 'NS') ? '-' : hasil.posisi,
                    hasil.namaAtlet,
                    hasil.namaKlub,  // Display the club name
                    new Date(hasil.tanggalLahir).toLocaleDateString('en-GB'),
                    hasil.prelimit,
                    hasil.result
                ]),
                startY: startY, // Start after the competition details
                margin: { top: 10 }, // Add margin to avoid overlap
                theme: 'plain',
                styles: {
                    lineWidth: 0,
                    fontSize: 9,
                    cellPadding: 1,
                    halign: 'center',
                    valign: 'middle',
                },
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    lineWidth: 0,
                },
                didDrawCell: (data) => {
                    const lastRowIndex = data.table.body.length - 1;
                    if (data.section === 'body' && data.row.index === lastRowIndex) {
                        const currentY = data.cell.y + data.cell.height + 2;
                        doc.setLineWidth(0.5);
                        doc.setDrawColor(0, 0, 0);
                        doc.line(20, currentY, pageWidth - 20, currentY); // Draw a single line under the row
                    }

                    // Draw explanation only once, after the last row
                    if (data.row.index === lastRowIndex) {
                        const explanationY = data.cell.y + data.cell.height + 8;
                        doc.setFontSize(8);
                        doc.text('* = Hasil sama', 20, explanationY);
                        doc.text('DQ = DISKUALIFIKASI', 20, explanationY + 4);
                        doc.text('NS = NO SWIM', 20, explanationY + 8);
                    }
                },
            });

            startY += 15 + sortedResults.length * 8; // Move startY down for the next event
        }
    });

    // Create blob URL for the generated PDF
    const blob = doc.output('blob');
    const unsafeUrl = URL.createObjectURL(blob);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
}

}
