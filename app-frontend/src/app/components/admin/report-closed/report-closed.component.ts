import {Component, OnInit} from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import {AdminService} from "../../../services/admin.service";
import Swal from "sweetalert2";
import { jsPDF } from 'jspdf';
import * as FileSaver from 'file-saver';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {LocalStorageService} from "../../../services/local-storage.service";


@Component({
  selector: 'app-report-closed',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './report-closed.component.html',
  styleUrl: './report-closed.component.scss'
})
export class ReportClosedComponent implements OnInit {
  blockedCards: any[] = [];
  filteredCards: any[] = [];
  selectedDate: string | null = null;
  constructor(private _adminService: AdminService, private _localStorage: LocalStorageService) {
  }

  ngOnInit(): void {
    this.loadReportFive();
  }

  loadReportFive() {
    this._adminService.getReportFive().subscribe((data) => {
        if (data && data.result) {
          this.blockedCards = data.result;
          this.filteredCards = [...this.blockedCards];
        }
      }, (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar el reporte'
        });
      }
    );
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  filterByDate() {
    if (this.selectedDate) {
      const limitDate = new Date(this.selectedDate);
      this.filteredCards = this.blockedCards.filter(card => new Date(card.credit_card_created_date) <= limitDate);
    } else {
      this.filteredCards = [...this.blockedCards];
    }
  }

  clearFilter() {
    this.selectedDate = null;
    this.filteredCards = [...this.blockedCards];
  }

  getCurrencySymbol(accountType: string): string {
    return accountType === 'gold' ? '$' : 'Q';
  }

  exportToPDF() {
    const username = this._localStorage.getEmail();
    const doc = new jsPDF();
    const reportDateText = this.selectedDate ? `Reporte hasta: ${this.formatDate(this.selectedDate)}` : "Todos los reportes";
    let y = 20;

    doc.setFontSize(18);
    doc.text('Reporte de Tarjetas Bloqueadas', 10, y);
    y += 6;
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 4;
    doc.line(10, y, 200, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Generado por: ${username}`, 10, y);
    y += 8;
    doc.text(reportDateText, 10, y);
    y += 4;
    doc.line(10, y, 200, y);
    y += 10;

    this.filteredCards.forEach((card, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(`Tarjeta ${index + 1}`, 10, y);
      y += 8;
      doc.setFontSize(12);
      doc.text(`Número de Tarjeta: **** **** **** ${card.credit_card_number.slice(-4)}`, 10, y);
      y += 8;
      doc.text(`Estado: ${this.formatState(card.state)}`, 10, y);
      y += 8;
      doc.text(`Motivo de Bloqueo: ${card.close_reason}`, 10, y);
      y += 8;
      doc.text(`Fecha de Bloqueo: ${this.formatDate(card.credit_card_created_date)}`, 10, y);
      y += 10;
    });

    doc.save('Cierre_de_Tarjetas.pdf');
  }



  exportToCSV() {
    const csvContent = [
      ["Número de Tarjeta", "Estado", "Motivo de Bloqueo", "Fecha de Bloqueo"],
      ...this.filteredCards.map(card => [
        card.credit_card_number,
        card.state,
        card.close_reason,
        this.formatDate(card.credit_card_created_date)
      ])
    ];
    const csvRows = csvContent.map(row => row.map(value => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, "Tarjetas_Bloqueadas.csv");
  }

  formatState(state: string): string {
    if(state === 'blocked') {
      return 'Bloqueada';
    }else if(state === 'closed') {
      return 'Cerrada';
    }
    return state;
  }


}
