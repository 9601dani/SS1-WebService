import {  Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { UserService } from '../../../services/user.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Comment } from '../../../interfaces/interfaces';
import { LocalStorageService } from '../../../services/local-storage.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink
    
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent  {

  comments: Comment[] = [];
  newComment = {
    id: 0,
    FK_User: 0,
    comment: '',
    created_at: new Date()
  };
  
  isLogged = false;

  constructor(
    private _userService: UserService,
    private _localStorageService: LocalStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this._userService.getComments().subscribe((comments: Comment[]) => {
      if(comments) {
        if(comments.length > 0){
          this.comments = comments;
        }else{
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Actualmente no hay comentarios',
          });
        }
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Actualmente no hay comentarios',
        });
      }
    }, (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Hubo un error al cargar los comentarios',
      });
    }
    );

    if(this._localStorageService.getEmail() !== null){
      this.isLogged = true;
    }
  }

  addComment() {
    if(this.newComment.comment === ''){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'El comentario no puede estar vacio',
      });
      return;
    }else{
      this.newComment.FK_User = this._localStorageService.getUserId();
      this._userService.addComment(this.newComment).subscribe((comments: Comment[]) => {
        if(comments) {
          if(comments.length > 0){
            this.comments = comments;
            this.newComment.comment = '';
            Swal.fire({
              icon: 'success',
              title: 'Comentario agregado',
              text: 'Tu comentario ha sido agregado con exito',
            });
          }else{
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Actualmente no hay comentarios',
            });
          }
        }else{
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Actualmente no hay comentarios',
          });
        }
      }, (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error.message,
        });
      });
    } 
  }

  goToPage(pageName: string) {
    this.router.navigate(['/page', pageName]); 
  }
}
