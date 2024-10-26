import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    private _adminService : AdminService
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

}
