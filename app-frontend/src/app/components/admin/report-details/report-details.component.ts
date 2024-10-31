import { Component } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import * as FileSaver from 'file-saver';
import { LocalStorageService } from '../../../services/local-storage.service';

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

  constructor(private adminService: AdminService, private _localStorage: LocalStorageService) {}

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

  exportToPDF() {
    const doc = new jsPDF();
    const userName = this._localStorage.getEmail();
    const date = new Date().toLocaleDateString('es-ES');

    doc.setFontSize(18);
    doc.text('Información de Tarjeta de Crédito', 10, 10);
    doc.setFontSize(12);
    doc.text(`Generado por: ${userName}`, 10, 20);
    doc.text(`Fecha de generación: ${date}`, 10, 28);
    doc.line(10, 32, 200, 32);

    let y = 40;
    doc.setFontSize(14);
    const cardDetails = [
      `Correo del Usuario: ${this.cardInfo.Correo_Usuario}`,
      `Nombre del Usuario: ${this.cardInfo.Nombre_Usuario}`,
      `Número de Tarjeta: ${this.cardInfo.Numero_Tarjeta}`,
      `Tipo de Cuenta: ${this.translateAccountType(this.cardInfo.Tipo_Cuenta)}`,
      `Límite de Crédito: ${this.cardInfo.Tipo_Cuenta === 'gold' ? '$' : 'Q'}${this.cardInfo.Limite_Credito}`,
      `Saldo Actual: ${this.cardInfo.Tipo_Cuenta === 'gold' ? '$' : 'Q'}${this.cardInfo.Saldo_Actual}`,
      `Fecha de Creación: ${this.formatDate(this.cardInfo.Fecha_Creacion)}`
    ];

    cardDetails.forEach(detail => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(detail, 10, y);
      y += 10;
    });

    doc.save('Información_Tarjeta.pdf');
  }

  exportToCSV() {
    const csvContent = [
      ["Correo del Usuario", "Nombre del Usuario", "Número de Tarjeta", "Tipo de Cuenta", "Límite de Crédito", "Saldo Actual", "Fecha de Creación"],
      [
        this.cardInfo.Correo_Usuario,
        this.cardInfo.Nombre_Usuario,
        this.cardInfo.Numero_Tarjeta,
        this.translateAccountType(this.cardInfo.Tipo_Cuenta),
        `${this.cardInfo.Tipo_Cuenta === 'gold' ? '$' : 'Q'}${this.cardInfo.Limite_Credito}`,
        `${this.cardInfo.Tipo_Cuenta === 'gold' ? '$' : 'Q'}${this.cardInfo.Saldo_Actual}`,
        this.formatDate(this.cardInfo.Fecha_Creacion)
      ]
    ];

    const csvRows = csvContent.map(row => row.map(value => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, "Información_Tarjeta.csv");
  }

}
