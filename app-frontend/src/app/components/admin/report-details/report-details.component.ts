import { Component } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './report-details.component.html',
  styleUrl: './report-details.component.scss'
})
export class ReportDetailsComponent {
  cardNumber: string = '';
  cardInfo: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {}

  getCardInfo(): void {
    if(!this.cardNumber){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingrese un número de tarjeta',
        });
      return;
    }
    if (this.cardNumber) {
      this.adminService.getReportThree(this.cardNumber).subscribe((data) => {
        if(data){
          this.cardInfo = data.result[0];
        }
      }, (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error.message,
          });

        });
    }
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  translateAccountType(type: string): string {
    switch (type) {
      case 'gold':
        return 'GOLD';
      case 'silver':
        return 'Plata';
      case 'platinum':
        return 'Platino';
      default:
        return 'Normal';
    }
  }

}
