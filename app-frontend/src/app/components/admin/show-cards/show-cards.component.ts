import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardsResponse } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-show-cards',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './show-cards.component.html',
  styleUrl: './show-cards.component.scss'
})
export class ShowCardsComponent implements OnInit {
  cards: any[] = [];
  searchTerm: string = '';


  constructor(
    private _adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.getAllCards();
  }

  getAllCards() {
    this._adminService.getAllCards().subscribe((data: CardsResponse) => {
      if (data && data.cards) {
        this.cards = data.cards; 
      }
    }, (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.error.message
      });
    });
  }
  
  filteredCards() {
    if (!this.searchTerm) {
      return this.cards;
    }

    const term = this.searchTerm.toLowerCase();

    return this.cards.filter((card) => {
      return (
        card.username.toLowerCase().includes(term) ||
        card.account_type.toLowerCase().includes(term) ||
        card.credit_card_type.toLowerCase().includes(term)
      );
    });
  }


  deshabilitarTarjeta(card: any) {

    Swal.fire({
      title: 'Seleccione el motivo de la deshabilitación',
      input: 'select',
      inputOptions: {
        '1': 'Tarjeta perdida',
        '2': 'Tarjeta robada',
        '3': 'Moroso'
      },
      inputPlaceholder: 'Seleccione un motivo',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Deshabilitar',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value !== ''){
            resolve();
          } else {
            resolve('Seleccione un motivo');
          }
        });
      }
    }).then((result) => {
      const reason = result.value;
      const reportType = result.value === '1' ? 'Tarjeta perdida' : result.value === '2' ? 'Tarjeta robada' : 'Moroso';

      if (result.isConfirmed) {
        this._adminService.updateCardState(card.id, 'disabled',reason, reportType).subscribe(
          (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Tarjeta deshabilitada',
            });
            this.getAllCards();
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al deshabilitar la tarjeta',
              text: error.error.message,
            });
          }
        );
      }
    }
    );
  }


  habilitarTarjeta(card: any) {
    let reason = '';
    Swal.fire({
      title: 'Seleccione el motivo de la habilitacion',
      input: 'select',
      inputOptions: {
        '1': 'Tarjeta no perdida',
        '2': 'Tarjeta no robada',
        '3': 'No Moroso'
      },
      inputPlaceholder: 'Seleccione un motivo',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Habilitar',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value !== '') {
            reason = value;
            resolve();
          } else {
            resolve('Seleccione un motivo');
          }
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = result.value;
        const reportType = result.value === '1' ? 'Tarjeta No perdida' : result.value === '2' ? 'Tarjeta No robada' : 'No Moroso';
        this._adminService.updateCardState(card.id, 'active',reason,reportType).subscribe(
          (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Tarjeta Habilitada',
            });
            this.getAllCards();
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al habilitar la tarjeta',
              text: error.error.message,
            });
          }
        );
      }
    }
    );
  }


}
