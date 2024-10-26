import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import Swal from 'sweetalert2';
import { LocalStorageService } from '../../../services/local-storage.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UserService } from '../../../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';

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
  recoverPasswordForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  isRecoverPassword = false;
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

    this.recoverPasswordForm = this.fb.group({
      email:  ["", Validators.required],
      newPassword: ["", Validators.required],
      confirmPassword: ["", Validators.required]
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

  forgotPin() {
    let pin: number | null = null; 
  
    Swal.fire({
      title: 'Recuperar PIN',
      input: 'text',
      inputLabel: 'Ingrese el número de su tarjeta de crédito',
      inputPlaceholder: 'Número de tarjeta',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async (creditCardNumber) => {
        try {
          const existPin = await this.recoverPin(creditCardNumber);
  
          if (!existPin) {
            Swal.showValidationMessage(`Número de tarjeta no válido`);
            return null; 
          } else {
            pin = existPin;
            return pin;
          }
        } catch (error) {
          Swal.showValidationMessage(`Error al recuperar el PIN: ${error}`);
          return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && pin !== null) {
        Swal.fire({
          title: `PIN enviado`,
          icon: 'success',
          text: `Su PIN es: ${pin}` 
        });
      }
    });
  }
  
  async recoverPin(card: number): Promise<number | null> {
    try {
      const response = await firstValueFrom(this._authService.recoverPin(card));
      if (response) {
        return response.pin; 
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  forgotPassword() {
    this.isRecoverPassword = true; 
    this.loginForm.reset(); 
  }

  updatePassword() {
    if (this.recoverPasswordForm.invalid) {
      Swal.fire('Error', 'Por favor, complete los campos requeridos', 'error');
      return;
    }

    const { email , newPassword, confirmPassword } = this.recoverPasswordForm.value;

    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    this.isLoading = true;

    this._authService.updatePassword(email,newPassword).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Su contraseña ha sido actualizada correctamente', 'success');
        this.isRecoverPassword = false; 
      },
      error: error => {
        Swal.fire('Error', error.error.message, 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
}
