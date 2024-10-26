import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../commons/navbar/navbar.component';
import { UserService } from '../../../services/user.service';
import { LocalStorageService } from '../../../services/local-storage.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';  
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {


  profileForm: FormGroup;
  notifications: string = 'yes';  

  constructor(
    private fb: FormBuilder, 
    private _userService: UserService,
    private _localStorageService: LocalStorageService
  ) {

    this.profileForm = this.fb.group({
      id: [{value: '', disabled: true}], 
      FK_User: [{value: '', disabled: true}], 
      name: ['', Validators.required], 
      nit: ['', Validators.required], 
      address: ['', Validators.required], 
      phone: ['', Validators.required], 
      description: ['', Validators.required]  
    });
  }

  ngOnInit(): void {
    this._userService.getMyProfile(this._localStorageService.getUserId()).subscribe(
      (response: any[]) => {
        if (response && response.length > 0) {
          this.assignProfileData(response[0]);
          this.notifications = response[0].notify ? 'yes' : 'no';
        } else {
          this.showError('No se pudo obtener la información del usuario');
        }
      },
      (error) => {
        this.showError('No se pudo obtener la información del usuario');
      }
    );
  }


  private assignProfileData(userProfile: any): void {
    this.profileForm.patchValue({
      id: userProfile.id,
      FK_User: userProfile.FK_User,
      name: userProfile.name,
      nit: userProfile.nit,
      address: userProfile.address,
      phone: userProfile.phone,
      description: userProfile.description
    });
  }


  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.showError('Por favor complete todos los campos');
      return;
    }


    const profileData = this.profileForm.getRawValue(); 
    console.log(profileData);

    this._userService.updateProfile(profileData).subscribe(
      (response) => {
        this.showSuccess('Perfil Actualizado', 'La información del perfil se actualizó correctamente');
      },
      (error) => {
        this.showError(error.error.message);
      }
    );
  }

  saveSecuritySettings(): void {
    let notifyme = this.notifications === 'yes' ? 1 : 0;
    const securityData = {
      id: this._localStorageService.getUserId(),
      notifyme: notifyme
    };

    this._userService.updateNotifications(securityData).subscribe(
      (response) => {
        this.showSuccess('Configuración de Seguridad Actualizada', 'La configuración de notificaciones se actualizó correctamente');
      },
      (error) => {
        this.showError(error.error.message);
      }
    );
  }

  onNotificationChange(value: string): void {
    this.notifications = value;
    this.saveSecuritySettings();
  }

  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }

  private showSuccess(title: string, message: string): void {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message
    });
  }
}
