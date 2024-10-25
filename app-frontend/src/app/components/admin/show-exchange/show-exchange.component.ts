import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-show-exchange',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './show-exchange.component.html',
  styleUrl: './show-exchange.component.scss'
})
export class ShowExchangeComponent implements OnInit {

  exchange: any;
  newExchangeRate!: number;

  constructor(
    private _userService: UserService,
    private _adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.loadExchange();
  }

  loadExchange(){
    this._userService.getContent('exchange').subscribe(
      (response: any) => {
        if (Array.isArray(response) && response.length > 0) {
         this.exchange = response[0].key_value;
        }
      }, (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Error al cargar el contenido. Intenta más tarde.',
        });
      })  
  }

  updateChange(){
    if (!this.newExchangeRate || isNaN(this.newExchangeRate) || this.newExchangeRate <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, ingrese un número válido mayor a 0 para el tipo de cambio.',
      });
      return;
    }
    Swal.fire({
      title: '¿Estás seguro de actualizar el tipo de cambio?',
      showDenyButton: true,
      confirmButtonText: `Sí`,
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this._adminService.updateExchangeRate('exchange',this.newExchangeRate).subscribe(
          (response: any) => {
            Swal.fire('¡Actualizado!', '', 'success');
            this.loadExchange();
            this.newExchangeRate = 0;
          }, (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Error al actualizar el tipo de cambio. Intenta más tarde.',
            });
          })
      } else if (result.isDenied) {
        Swal.fire('No se actualizó el tipo de cambio', '', 'info')
      }
    });
  }

}
