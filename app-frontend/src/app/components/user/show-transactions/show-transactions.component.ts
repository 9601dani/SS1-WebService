import { Component } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { Transaction } from '../../../interfaces/interfaces';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '../../../services/local-storage.service';
import Swal from 'sweetalert2';

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
  
}
