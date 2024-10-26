import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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
  constructor(private adminService: AdminService) {}

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
}
