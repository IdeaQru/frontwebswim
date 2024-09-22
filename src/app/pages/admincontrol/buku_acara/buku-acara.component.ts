import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable for generating tables in PDF
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { parsePrelimit } from 'src/app/utils/time-utils';
import { SeriesLaneService } from 'src/app/services/series-lane.service';

@Component({
  selector: 'app-buku-acara',
  templateUrl: './buku-acara.component.html',
  styleUrls: ['./buku-acara.component.css']
})
export class BukuAcaraComponent implements OnInit {
  atlets: any[] = [];
  klubs: any[] = [];
  kelompokUmurs: any[] = [];
  perlombaans: any[] = [];
  pendaftaranLomba: any[] = [];
  catatanWaktu: any[] = [];
  bukuAcara: any[] = [];
  pdfUrl: string | null = null;  // Variabel untuk menyimpan URL PDF Blob

  constructor(private http: HttpClient, private authService: AuthService,private seriesLaneService: SeriesLaneService) {}

  ngOnInit(): void {
    this.fetchAtletData();
    this.fetchKlubData(); // Fetch the club data
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
      (response: any) => { this.atlets = response.data; this.generateBukuAcara(); },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch atlets.', icon: 'error' }); }
    );
  }
  fetchKlubData() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/klubs', { headers }).subscribe(
      (response: any) => { this.klubs = response.data; this.generateBukuAcara(); },
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
    this.http.get('http://localhost:3000/api/perlombaan', { headers }).subscribe(
      (response: any) => { this.perlombaans = response.data; },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch perlombaan.', icon: 'error' }); }
    );
  }

  fetchPendaftaranLomba() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/pendaftaran-lomba', { headers }).subscribe(
      (response: any) => { this.pendaftaranLomba = response.data; this.generateBukuAcara(); },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch pendaftaran lomba.', icon: 'error' }); }
    );
  }

  fetchCatatanWaktu() {
    const headers = this.getHeaders();
    this.http.get('http://localhost:3000/api/catatan-waktu-atlet', { headers }).subscribe(
      (response: any) => { this.catatanWaktu = response.data; this.generateBukuAcara(); },
      (error) => { Swal.fire({ title: 'Error!', text: 'Failed to fetch catatan waktu.', icon: 'error' }); }
    );
  }

  generateBukuAcara() {
    if (this.atlets.length > 0 && this.perlombaans.length > 0 && this.kelompokUmurs.length > 0 && this.pendaftaranLomba.length > 0 && this.catatanWaktu.length > 0) {
      // Generate buku acara berdasarkan data yang telah diambil
      this.bukuAcara = this.perlombaans.map(perlombaan => {
        const pendaftaranForPerlombaan = this.pendaftaranLomba.filter(pendaftaran => pendaftaran.idPerlombaan === perlombaan.idPerlombaan);
        const atletForPerlombaan = pendaftaranForPerlombaan.map(pendaftaran => {
          const atlet = this.atlets.find(a => a.idAtlet === pendaftaran.idAtlet);
          const klub = this.klubs.find(k => k.idKlub === atlet?.idKlub);
          const catatanWaktuAtlet = this.catatanWaktu.find(cw => cw.idAtlet === atlet.idAtlet && cw.idPerlombaan === perlombaan.idPerlombaan);
          const prelimit = catatanWaktuAtlet ? parsePrelimit(catatanWaktuAtlet.Prelimit) : 'No time recorded';
          return { ...atlet, namaKlub: klub ? klub.namaKlub : 'Unknown',  prelimit, idKelompokUmur: pendaftaran.idKelompokUmur };
        });

        return {
          idPerlombaan: perlombaan.idPerlombaan,  // Tambahkan idPerlombaan di sini
          nomorPerlombaan: perlombaan.namaPerlombaan,
          kelompokUmur: this.kelompokUmurs.find(kelompok => kelompok.idKelompokUmur === perlombaan.idKelompokUmur)?.namaKelompokUmur || 'Unknown',
          gender: perlombaan.gender,
          atlet: atletForPerlombaan
        };
      });
    }
  }

  generatePdfPreview() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    const centerX = pageWidth / 2; // Calculate center X for aligning text

    // Add a title for the document
    doc.setFontSize(16); // Smaller font size to save space
    doc.setFont('helvetica', 'bold'); // Set the font to bold for title
    doc.text('Buku Acara', centerX, 15, { align: 'center' });

    const keterangan: string = "................";
    let startY = 25; // Initial Y position, slightly reduced

    // Iterate over each event (perlombaan)
    this.bukuAcara.forEach((perlombaan, index) => {
        // Header for each event
        doc.setFontSize(11); // Use smaller font size for event headers
        doc.setFont('helvetica', 'bold'); // Bold font for the header
        doc.text(`Nomor Acara: ${perlombaan.idPerlombaan}`, 20, startY);
        doc.text(`Perlombaan: ${perlombaan.nomorPerlombaan} KU: ${perlombaan.kelompokUmur}   ${perlombaan.gender}`, 20, startY + 6); // Reduced space

        // Add a line separator after the event header
        doc.setLineWidth(0.5); // Border thickness
        doc.setDrawColor(0, 0, 0); // Border color (black)
        doc.line(20, startY + 15, pageWidth - 20, startY + 15); // Draw a thin line

        startY += 18; // Reduced the Y increment to save space

        // Use the seriesLaneService to assign series and lanes
        let series = this.seriesLaneService.assignSeriesAndLanes(perlombaan.atlet);
        console.log(perlombaan.atlet);

        // Generate the series in the correct order
        series.forEach((athletesInSeries, seriesIndex) => {
            let seriesNumber = seriesIndex + 1;

            // Add "Seri ke X" text
            doc.setFont('helvetica', 'normal');
            doc.text(`Seri ke: ${seriesNumber}`, centerX, startY + 6, { align: 'center' });

            // Generate table of athletes for the current series with normal lane numbering (1-8)
            const tableBody = athletesInSeries.map((atlet: any, idx: number ) => [
                idx + 1, // Lintasan numbering is sequential 1-8 for display
                atlet?.namaAtlet || '................', // Ensure namaAtlet is valid or use placeholder
                atlet?.namaKlub || '................',  // Club name
                this.formatDate(atlet?.tanggalLahir), // Ensure tanggalLahir is valid
                atlet?.prelimit || '................', // Ensure prelimit is valid or use placeholder
                keterangan
            ]);

            autoTable(doc, {
              head: [['Lintasan', 'Nama Atlet', 'Asal Club','Tanggal Lahir', 'Prelimit', 'Keterangan']],
              body: tableBody,
              startY: startY + 10, // Adjust startY for each series
              theme: 'plain', // No borders in table
              styles: {
                  lineWidth: 0, // Remove border in body
                  fontSize: 9, // Smaller font for content to save space
                  cellPadding: 1, // Reduce padding to make table more compact
                  halign: 'center', // Center align content text
                  valign: 'middle',
              },
              headStyles: {
                  fillColor: [255, 255, 255], // No fill color
                  textColor: [0, 0, 0], // Black text
                  fontStyle: 'bold',
                  halign: 'center', // Center align header text
                  valign: 'middle',
                  lineWidth: 0, // Remove all borders except bottom
              },
              didDrawCell: function(data) {
                  if (data.section === 'head') {
                      var doc = data.doc;
                      var cell = data.cell;


                      // Draw bottom border only for the header
                      doc.setLineWidth(0.2); // Border thickness
                      doc.setDrawColor(0, 0, 0); // Border color (black)
                      doc.line(20, startY + 15, pageWidth - 20, startY + 15); // Draw line at the bottom of the cell
                  }
              },
              tableLineColor: [255, 255, 255], // No table line color for body
              tableLineWidth: 0 // No border for body rows
          });


            // Increment startY for the next series, reduced the spacing to save space
            startY += 15 + (athletesInSeries.length * 7); // Adjust the Y position for the next series
        });

        // Add additional space between different events
        startY += 5; // Reduced the space between events to save pages
    });

    // Convert PDF to blob and create URL for preview
    const blob = doc.output('blob');
    this.pdfUrl = URL.createObjectURL(blob);  // Create a URL for the Blob to be shown in the preview
}


// Utility function to format date properly or handle invalid dates
formatDate(date: any): string {
  if (!date || isNaN(new Date(date).getTime())) {
    return '................'; // Handle cases where date is invalid or missing
  }
  return new Date(date).toLocaleDateString('en-GB'); // Return formatted date
}



}
