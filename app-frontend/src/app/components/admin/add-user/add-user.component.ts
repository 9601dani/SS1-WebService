import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../commons/navbar/navbar.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { UserService } from "../../../services/user.service";
import Swal from "sweetalert2";
import {ExternalService} from "../../../services/external.service";

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  userForm: FormGroup;
  roles: any[] = [];
  cards_name = ['Visa', 'MasterCard', 'American Express'];

  hidePassword = true;
  hideConfirmPassword = true;
  hidePin = true;

  ngOnInit() {
    this.getRoles();
    this.userForm.get('accountType')?.setValue('normal');
    this.userForm.get('creditCardType')?.setValue('Visa');
  }

  constructor(
    private fb: FormBuilder,
    private _userService: UserService,
    private _externalService: ExternalService
  ) {
    this.userForm = this.fb.group({
      accountNumber: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]*$')]],
      role: ['', Validators.required],
      accountType: ['', Validators.required],
      creditCardType: ['', Validators.required]
    }, { validator: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  togglePinVisibility() {
    this.hidePin = !this.hidePin;
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Formulario válido:', this.userForm.value);
    } else {
      console.log('Formulario inválido');
    }
  }

  getRoles() {
    this._userService.getRoles().subscribe(
      (data: any) => {
        if (data) {
          this.roles = data;
          this.userForm.get('role')?.setValue(this.roles[0].id);
        }
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener los roles'
        });
      }
    );
  }
  fetchAccountInfo() {
    const accountNumber = this.userForm.get('accountNumber')?.value;

    if (!accountNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese un número de cuenta válido.'
      });
      return;
    }

    this._externalService.getAccountBank(accountNumber).subscribe(accountInfo => {
      if (accountInfo && !accountInfo.error) {
        this.userForm.get('username')?.setValue(accountInfo.nombre_usuario);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Cuenta bancaria no encontrada.'
        });
      }
    });
  }

  generateEmail() {
    const username = this.userForm.get('username')?.value;
    const accountType = this.userForm.get('accountType')?.value;
    const creditCardType = this.userForm.get('creditCardType')?.value;

    if (!username || !accountType || !creditCardType) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Complete los campos de nombre de usuario, tipo de cuenta y tipo de tarjeta para generar el correo'
      });
      return;
    }

    const email = `${username}.${accountType}@${creditCardType.toLowerCase()}.com`;
    this.userForm.get('email')?.setValue(email);
  }
}
