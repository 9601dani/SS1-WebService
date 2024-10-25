import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import Swal from 'sweetalert2';
import { LocalStorageService } from '../../../services/local-storage.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UserService } from '../../../services/user.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent
  ],
  providers: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  hide = true;

  constructor(
    private fb: FormBuilder,
    private _authService: UserService,
    private _localStorageService: LocalStorageService,
    private _cookieService: CookieService,
    private _router: Router
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  get usernameOrEmailHasErrorRequired() {
    return this.loginForm.get("usernameOrEmail")?.hasError("required");
  }

  get passwordHasErrorRequired() {
    return this.loginForm.get("password")?.hasError("required");
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onLogin() {
    this.isLoading = true;

    if (this.loginForm.invalid) {
      Swal.fire('Error', 'Por favor, complete los campos requeridos', 'error');
      return;
    }

    const { usernameOrEmail, password } = this.loginForm.value;

    this._authService.login(usernameOrEmail, password).subscribe({
      next: response => {
        this._cookieService.set('token', response.token,1);
        this._localStorageService.setUserId(response.user.id);
        this._localStorageService.setEmail(response.user.email);

        /* if (response.is2FA) {
          this._router.navigate(['/verify-2fa']);
          return;
        } */
        this._router.navigate(['/home']);
      },
      error: error => {
        Swal.fire({
          title: "Error!",
          text: error.error.message,
          icon: "error"
        });
        this.isLoading = false;

        this.loginForm.reset({
          usernameOrEmail: '',
          password: ''
        });

        this.loginForm.markAllAsTouched();
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  forgotPassword() {
    Swal.fire("¡Lo sentimos!", "Esta funcionalidad aún no está disponible", "info");
  }
}
