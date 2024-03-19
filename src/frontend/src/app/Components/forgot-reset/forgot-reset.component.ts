import { Component } from '@angular/core';
import { AppUser } from '../../Entities/AppUser';

@Component({
  selector: 'app-forgot-reset',
  templateUrl: './forgot-reset.component.html',
  styleUrl: './forgot-reset.component.css'
})
export class ForgotResetComponent {
  newUser: AppUser = {
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    Token: '',
  };
  confirmPassword: string = '';

  passwordMatch(): boolean {
    return this.newUser.Password === this.confirmPassword;
  }
}
