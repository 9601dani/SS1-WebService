import { Component } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { Transaction } from '../../../interfaces/interfaces';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '../../../services/local-storage.service';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-show-transactions',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './show-transactions.component.html',
  styleUrl: './show-transactions.component.scss'
})
export class ShowTransactionsComponent {
  startDate: string = '';
  endDate: string = '';
  transactions: Transaction[] = [];
  allTransactions: Transaction[] = [];
  current_balance: number = 0;
  account_type: string = '';


  constructor(
    private _userService: UserService,
    private _localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.transactions = [];
    this.loadTransactions();
  }


  loadTransactions() {
    this._userService.getTransactions(this._localStorageService.getUserId()).subscribe(
      (response) => {
        this.allTransactions = response;
        this.transactions = [...this.allTransactions];
        this.current_balance = this.transactions[0].current_balance;
        this.account_type = this.transactions[0].account_type;
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error.message
        });
      }
    );
  }
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\d{4}(?=.)/g, '$&-');
  }

  getCurrencySymbol(accountType: string): string {
    return accountType === 'gold' ? '$' : 'Q';
  }

  translateTransactionType(transactionType: string): string {
    if (transactionType === 'increase') {
      return 'Incremento';
    } else if (transactionType === 'decrease') {
      return 'Decremento';
    } else {
      return transactionType;
    }
  }

  fetchTransactions() {
    if (!this.startDate || !this.endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas requeridas',
        text: 'Por favor selecciona un rango de fechas válido.'
      });
      return;
    }

    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);

    if (startDate > endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Error en las fechas',
        text: 'La fecha de inicio no puede ser mayor que la fecha de fin.'
      });
      return;
    }

    const filteredTransactions = this.allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    if (filteredTransactions.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin transacciones',
        text: 'No se encontraron transacciones en el rango de fechas seleccionado.'
      });
    } else {
      this.transactions = filteredTransactions;
    }

    if (filteredTransactions.length > 0) {
      this.current_balance = filteredTransactions[0].current_balance;
      this.account_type = filteredTransactions[0].account_type;
    } else {
      this.current_balance = 0;
      this.account_type = '';
    }
  }

  clearFilter() {
    this.transactions = [...this.allTransactions];
    this.current_balance = this.transactions[0].current_balance;
    this.account_type = this.transactions[0].account_type;
    this.startDate = '';
    this.endDate = '';
  }

  exportToPDF() {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('es-ES');

    const userEmail = this._localStorageService.getEmail();
    const cardNumber = this.transactions.length > 0 ? this.formatCardNumber(this.transactions[0].credit_card_number) : 'N/A';
  
    doc.setFontSize(18);
    doc.text('Movimientos Tarjeta de Crédito', 10, 10);
    doc.setLineWidth(0.5);
    doc.line(10, 14, 200, 14);
  
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${date}`, 10, 20);
    doc.text(`Generado por: ${userEmail}`, 10, 28);
    doc.text(`Número de Tarjeta: ${cardNumber}`, 10, 36);
    doc.line(10, 40, 200, 40);
  
    let y = 46;
  
    this.transactions.forEach((transaction, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
  
      doc.setFontSize(14);
      doc.text(`Transacción ${String(index + 1)}`, 10, y);
      y += 8;
  
      doc.setFontSize(12);
      doc.text(`Tipo: ${String(this.translateTransactionType(transaction.transaction_type))}`, 10, y);
      y += 8;
      doc.text(`Monto: ${String(this.getCurrencySymbol(transaction.account_type))} ${parseFloat(String(transaction.amount)).toFixed(2)}`, 10, y);
      y += 8;
      doc.text(`Fecha: ${new Date(transaction.transaction_date).toLocaleDateString('es-ES')}`, 10, y);
      y += 8;
      doc.text(`Descripción: ${String(transaction.description || 'N/A')}`, 10, y);
      y += 8;
      doc.text(`Comisión: ${String(this.getCurrencySymbol(transaction.account_type))} ${parseFloat(String(transaction.fee)).toFixed(2)}`, 10, y);
      y += 8;
      doc.text(`Tipo de Cambio: ${parseFloat(String(transaction.exchange_rate)).toFixed(4)}`, 10, y);
      y += 10;
  
      doc.setDrawColor(200, 200, 200);
      doc.line(10, y, 200, y);
      y += 8;
    });
      y += 10;
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.line(10, y, 200, y);
      y += 10;

      doc.setFontSize(14);
      doc.text(`Balance actual: ${this.getCurrencySymbol(this.account_type)} ${parseFloat(String(this.current_balance)).toFixed(2)}`, 10, y);

      doc.save('Movimientos_Tarjeta_Credito.pdf');
  }
  
  
  
  exportToCSV() {
    const csvContent = [
      ["ID", "Tipo", "Monto", "Fecha", "Descripción", "Comisión", "Tipo de Cambio"],
      ...this.transactions.map((transaction, index) => [
        String(index + 1),
        this.translateTransactionType(transaction.transaction_type),
        `${this.getCurrencySymbol(transaction.account_type)} ${parseFloat(String(transaction.amount)).toFixed(2)}`,
        new Date(transaction.transaction_date).toLocaleDateString('es-ES'),
        transaction.description || 'N/A',
        `${this.getCurrencySymbol(transaction.account_type)} ${parseFloat(String(transaction.fee)).toFixed(2)}`,
        parseFloat(String(transaction.exchange_rate)).toFixed(4)
      ])
    ];
  
    const csvRows = csvContent.map(row => row.map(value => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, "Movimientos_Tarjeta_Credito.csv");
  }
  
  
}
