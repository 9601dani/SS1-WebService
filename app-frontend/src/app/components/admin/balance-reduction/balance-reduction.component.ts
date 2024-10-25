import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-balance-reduction',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './balance-reduction.component.html',
  styleUrl: './balance-reduction.component.scss'
})
export class BalanceReductionComponent implements OnInit {
  cardNumber!: string;
  paymentAmount!: number;
  creditCard: any;
  errorMessage!: string;

  constructor(
    private _adminService: AdminService,
    private _userService: UserService
  ) {}

  ngOnInit(): void {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault(); 
      this.getCardDetails();
    }
  }

  getCardDetails() {
    this._adminService.getCardByNumber(this.cardNumber).subscribe(
      (response) => {
        console.log(response);
        this.creditCard = response.card;
        this.errorMessage = '';
      },
      (error) => {
        this.errorMessage = 'Tarjeta no encontrada';
        this.creditCard = null;
      }
    );
  }

  reduceBalance() {
    if(this.paymentAmount==null || this.paymentAmount==undefined){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingrese un monto válido para el pago',
      });
      return;
    }

    let exchangeRate: number = 1;
    this._userService.getContent('exchange').subscribe((response) => {
      if(response) {
        exchangeRate = Number(response[0].key_value);
        if (!this.paymentAmount || this.paymentAmount <= 0) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Ingrese un monto válido para el pago',
          });
          return;
        }
    
        console.log('Account type', this.creditCard.account_type);
        if(this.creditCard.account_type == 'gold') {
          if(exchangeRate > 1) {
            if(this.paymentAmount > this.creditCard.current_balance * exchangeRate) {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'El monto a pagar es menor al saldo actual',
              });
              return;
            }
          }
        }else{
         if(this.paymentAmount > this.creditCard.current_balance) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'El monto a pagar es menor al saldo actual',
            });
            return;
          }
        }
        if(this.creditCard.state == 'disabled') {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'La tarjeta se encuentra deshabilitada',
          });
          return;
        }
        this._adminService.reduceBalance(this.cardNumber, this.paymentAmount).subscribe(
          (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Pago realizado con éxito',
              text: response.message,
            });
            this.getCardDetails();
            this.paymentAmount = 0;
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error.message,
            });
          }
        ); 
      }
    });
  }
}
