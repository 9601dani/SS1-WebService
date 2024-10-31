import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import * as FileSaver from 'file-saver';
import { LocalStorageService } from '../../../services/local-storage.service';

@Component({
  selector: 'app-report-blocked',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './report-blocked.component.html',
  styleUrl: './report-blocked.component.scss'
})
export class ReportBlockedComponent implements OnInit {
  blockedCards: any[] = [];

  constructor(
    private _adminService : AdminService,
    private _localStorage : LocalStorageService
  ) { }

  ngOnInit(): void {
    this.getBlockedCards();
  }

  getBlockedCards(): void {
    this._adminService.getReportTwo().subscribe((data) => {
      if(data){
        console.log(data);
         this.blockedCards = data.result;
      }
    });
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  translateReason(reason: string): string {
    switch (reason) {
      case 'theft':
        return 'Robo De Tarjeta';
      case 'loss':
        return 'Pérdida De Tarjeta';
      case 'late':
        return 'Pago Tardío De Tarjeta';
      default:
        return reason; 
    }
  }

  exportToPDF() {
    const username = this._localStorage.getEmail();
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('es-ES');
  
    doc.setFontSize(18);
    doc.text('Reporte de Tarjetas Bloqueadas', 10, 10);
    doc.setLineWidth(0.5);
    doc.line(10, 14, 200, 14);
  

    doc.setFontSize(12);
    doc.text(`Generado por: ${username}`, 10, 20);
    doc.text(`Fecha de generación: ${date}`, 10, 28);
    doc.line(10, 32, 200, 32);
  
    let y = 40;
  
    this.blockedCards.forEach((card, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(`Tarjeta ${index + 1}`, 10, y);
      y += 8;
  
      doc.setFontSize(12);
      doc.text(`Número de Tarjeta: **** **** **** ${card.Numero_Tarjeta.slice(-4)}`, 10, y);
      y += 8;
      doc.text(`Estado: ${card.Estado}`, 10, y);
      y += 8;
      doc.text(`Motivo de Bloqueo: ${this.translateReason(card.Motivo_Bloqueo)}`, 10, y);
      y += 8;
      doc.text(`Fecha de Bloqueo: ${this.formatDate(card.Fecha_Bloqueo)}`, 10, y);
      y += 10;
  
      doc.setDrawColor(200, 200, 200);
      doc.line(10, y, 200, y);
      y += 8;
    });
  
    doc.save('Tarjetas_Bloqueadas.pdf');
  }
  

  exportToCSV() {
    const csvContent = [
      ["Número de Tarjeta", "Estado", "Motivo de Bloqueo", "Fecha de Bloqueo"],
      ...this.blockedCards.map(card => [
        card.Numero_Tarjeta,
        card.Estado,
        this.translateReason(card.Motivo_Bloqueo),
        this.formatDate(card.Fecha_Bloqueo)
      ])
    ];

    const csvRows = csvContent.map(row => row.map(value => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, "Tarjetas_Bloqueadas.csv");
  }

}
