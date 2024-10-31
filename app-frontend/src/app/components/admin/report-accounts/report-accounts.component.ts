import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import * as FileSaver from 'file-saver';
import { LocalStorageService } from '../../../services/local-storage.service';

@Component({
  selector: 'app-report-accounts',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './report-accounts.component.html',
  styleUrl: './report-accounts.component.scss'
})
export class ReportAccountsComponent implements OnInit {

  accounts: any[] = [];
  active_accounts: any[] = [];
  disabled_accounts: any[] = [];

  constructor(
    private _adminService: AdminService,
    private _localStorage: LocalStorageService

  ) { }
  
  ngOnInit(): void {
    this.loadReportFour();
  }

  loadReportFour() {
    this._adminService.getReportFour().subscribe(
      data => {
        this.accounts = data.result;
        this.active_accounts = data.active
        this.disabled_accounts = data.disabled;
      },
      error => {
        console.log(error);
      }
    );
  }

  getCurrencySymbol(accountType: string): string {
    return accountType === 'gold' ? '$' : 'Q';
  }
  
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  toUpperCase(value: string): string {
    return value.toUpperCase();
  }

  exportToPDF() {
    const userName = this._localStorage.getEmail();
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('es-ES');
  
    doc.setFontSize(18);
    doc.text('Reporte de Cuentas por Estado', 10, 10);
    doc.setFontSize(12);
    doc.text(`Generado por: ${userName}`, 10, 20);
    doc.text(`Fecha de generación: ${date}`, 10, 28);
    doc.line(10, 32, 200, 32);
  
    let y = 40;
  
    const printAccountSection = (accounts: any[], sectionTitle: string) => {
      doc.setFontSize(16);
      doc.text(sectionTitle, 10, y);
      y += 10;
      doc.setFontSize(12);
  
      accounts.forEach((account, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
  
        doc.setFontSize(14);
        doc.text(`Cuenta ${index + 1}`, 10, y);
        doc.setFontSize(12);
        y += 8;
        doc.text(`Tipo de Cuenta: ${this.toUpperCase(account.account_type)}`, 10, y);
        y += 8;
        doc.text(`Número de Tarjeta: **** **** **** ${account.credit_card_number.slice(-4)}`, 10, y);
        y += 8;
        doc.text(`Tipo de Tarjeta: ${account.credit_card_type}`, 10, y);
        y += 8;
        doc.text(`Límite de Crédito: ${this.getCurrencySymbol(account.account_type)}${account.credit_limit}`, 10, y);
        y += 8;
        doc.text(`Fecha de Creación: ${this.formatDate(account.created_at)}`, 10, y);
        y += 8;
        doc.text(`Fecha de Expiración: ${account.expiration_date}`, 10, y);
        y += 10;
  
        doc.setDrawColor(200, 200, 200);
        doc.line(10, y, 200, y);
        y += 8;
      });
  
      y += 10;
    };
  
    printAccountSection(this.active_accounts, 'Cuentas Activas');
    printAccountSection(this.disabled_accounts, 'Cuentas Inactivas');
  
    doc.save('Reporte_Cuentas.pdf');
  }
  
  

  exportToCSV() {
    let csvContent = "Tipo de Cuenta,Número de Tarjeta,Tipo de Tarjeta,Límite de Crédito,Fecha de Creación,Fecha de Expiración\n";
  
    this.active_accounts.concat(this.disabled_accounts).forEach(account => {
      const row = [
        `"${this.toUpperCase(account.account_type)}"`,
        `"**** **** **** ${account.credit_card_number.slice(-4)}"`,
        `"${account.credit_card_type}"`,
        `"${this.getCurrencySymbol(account.account_type)}${account.credit_limit}"`,
        `"${this.formatDate(account.created_at)}"`,
        `"${account.expiration_date}"`
      ].join(",");
  
      csvContent += row + "\n";
    });
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, "Reporte_Cuentas.csv");
  }
  
  
}
