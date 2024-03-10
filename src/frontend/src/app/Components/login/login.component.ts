import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../Services/login.service';
import { AppUser } from '../../Entities/AppUser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  newUser: AppUser = {
    Email: '',
    Password: '',
  };

  loggedIn = false;

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {}

  login() {
    this.loginService.login(this.newUser).subscribe({
      next: (response) => {
        console.log(response);
        localStorage.setItem('id', response.id);
        localStorage.setItem('token', response.token);
        this.loggedIn = true;
        this.router.navigate(['/home']);
        console.log('Successful login');
      },
      error: (error) => {
        console.log(error);
        console.log('Unsuccessful login');
      },
    });
  }
}
