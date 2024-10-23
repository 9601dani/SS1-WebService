import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './dynamic-page.component.html',
  styleUrl: './dynamic-page.component.scss'
})
export class DynamicPageComponent implements OnInit {
  content: SafeHtml = '';
  keyName: string = '';
  
  contactData = {
    name: '',
    email: '',
    message: ''
  };

  constructor(
    private route: ActivatedRoute, 
    private contentService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.keyName = params['page'];
      this.loadContent(this.keyName);  
    });
  }

  loadContent(keyName: string) {
    this.contentService.getContent(keyName).subscribe(
      (response: any) => {
        if (Array.isArray(response) && response.length > 0) {
          this.content = this.sanitizer.bypassSecurityTrustHtml(response[0].key_value);
        } else {
          this.content = '<p>No se encontró contenido para esta página.</p>';
        }
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Error al cargar el contenido. Intenta más tarde.',
        });
        this.content = '<p>Error al cargar el contenido. Intenta más tarde.</p>';
      }
    );
  }

  handleSubmit() {
    if (this.contactData.name && this.contactData.email && this.contactData.message) {
      console.log('Formulario enviado:', this.contactData);
      // Aquí podrías enviar los datos a un servicio, si es necesario
      // this.service.sendForm(this.contactData).subscribe(response => { ... });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, completa todos los campos.',
      });
    }
  }
}
