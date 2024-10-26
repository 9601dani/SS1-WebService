import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    private _adminService: AdminService
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
  
}
