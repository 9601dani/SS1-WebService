import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import * as FileSaver from 'file-saver';
import { LocalStorageService } from '../../../services/local-storage.service';

@Component({
  selector: 'app-report-trans',
  standalone: true,
  imports:[
    NavbarComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './report-trans.component.html',
  styleUrls: ['./report-trans.component.scss']
})
export class ReportTransComponent implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  startDate: string | null = null;
  endDate: string | null = null;
  constructor(private adminService: AdminService, private _localStorage: LocalStorageService) {}

  ngOnInit(): void {
    this.getReport();
  }

  getReport(): void {
    this.adminService.getReportOne().subscribe((data: any) => {
      this.transactions = data.result;
      this.filteredTransactions = [...this.transactions];
    });
  }

  filterByDate(): void {
    if (!this.startDate || !this.endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No has seleccionado fechas a filtrar!',
      });
      return;
    }
  
    if (this.startDate != null && this.endDate != null) {
      this.filteredTransactions = this.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.Fecha).toISOString().split('T')[0];
        return transactionDate >= this.startDate! && transactionDate <= this.endDate!;
      });
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No has seleccionado fechas a filtrar!',
      });
    }
  }
  

  clearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.filteredTransactions = [...this.transactions];
  }
  
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  exportTransactionsToPDF() {
    const userName = this._localStorage.getEmail();
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('es-ES');
  
    doc.setFontSize(18);
    doc.text('Reporte de Transacciones', 10, 10);
    doc.setFontSize(12);
    doc.text(`Generado por: ${userName}`, 10, 20);
    doc.text(`Fecha de generación: ${date}`, 10, 28);
    doc.line(10, 32, 200, 32);
  
    let y = 40;
    doc.setFontSize(16);
    doc.text('Transacciones', 10, y);
    y += 10;
  
    doc.setFontSize(12);
    this.filteredTransactions.forEach((transaction, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20; 
      }
  
      doc.setFontSize(14);
      doc.text(`Transacción ${index + 1}`, 10, y);
      doc.setFontSize(12);
      y += 8;
      doc.text(`Fecha: ${this.formatDate(transaction.Fecha)}`, 10, y);
      y += 8;
      doc.text(`Tipo de Movimiento: ${transaction.Tipo_Movimiento}`, 10, y);
      y += 8;
      doc.text(`Monto: ${transaction.Tipo_Cuenta === 'gold' ? '$' : 'Q'}${transaction.Monto}`, 10, y);
      y += 8;
      doc.text(`Número de Cuenta: ${transaction.Numero_Cuenta}`, 10, y);
      y += 10;
  
      doc.setDrawColor(200, 200, 200);
      doc.line(10, y, 200, y);
      y += 8;
    });
  
    doc.save('Reporte_Transacciones.pdf');
  }

  exportTransactionsToCSV() {
    let csvContent = "Fecha,Tipo de Movimiento,Monto,Número de Cuenta\n";

    this.filteredTransactions.forEach(transaction => {
      const row = [
        `"${this.formatDate(transaction.Fecha)}"`,
        `"${transaction.Tipo_Movimiento}"`,
        `"${transaction.Tipo_Cuenta === 'gold' ? '$' : 'Q'}${transaction.Monto}"`,
        `"${transaction.Numero_Cuenta}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, "Reporte_Transacciones.csv");
  }
}
