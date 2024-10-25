import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { LocalStorageService } from '../../../services/local-storage.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  isLogged: boolean = false;
  isActive: boolean = false;
  showButtons: boolean = true;
  activeModule: any;
  modules: any[] = [];
  logoUrl = "";
  userPhoto = "";
  email = "";
  homeLink: string = '/home';
  notOptionsUrls = ['login', 'verify-2fa', 'verify-email'];
  constructor(
    private _localStorageService: LocalStorageService,
    private router: Router,
    private _userService: UserService
  ) { }

  ngOnInit(): void {
    this.isLogged = this._localStorageService.getUserId() !== null;

    this.homeLink = this.isLogged ? '/home' : '/login';

    if (this.isLogged) {
      this.email = this._localStorageService.getEmail();
      this.showButtons = true;
      this.getPages();
    }

    this.showOptions();
  }

  getPages() {
    const id = this._localStorageService.getUserId();
    this._userService.getPages(id).subscribe((data: any[]) => {
      if(data.length > 0) {
        this.modules = data;
      }else{
        Swal.fire({
          title: 'Error',
          text: 'No se encontraron módulos',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }


  showOptions() {
    const url = this.router.url.split("/")[1];
    this.showButtons = !this.notOptionsUrls.includes(url);
  }

  toggleNavbar() {
    this.isActive = !this.isActive;
  }

  toggleSubmenu(module: string) {
    this.activeModule = this.activeModule === module ? null : module;
  }

  myAccount() {
    this.router.navigate(['/edit/profile']);
  }

  logout() {
    this._localStorageService.logout();
    this.router.navigate(['/login']);
  }

}
