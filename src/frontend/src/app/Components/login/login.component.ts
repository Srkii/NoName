import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../_services/login.service';
import { AppUser } from '../../Entities/AppUser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NotificationsService } from '../../_services/notifications.service';

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

  constructor(private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private notifications:NotificationsService) {}

  ngOnInit(): void {}

  login() {
    this.loginService.login(this.newUser).subscribe({
      next: (response) => {
        localStorage.setItem('id', response.id);
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        this.notifications.createHubConnection(this.newUser);
        if(localStorage.getItem('role')=='0')
        {
          this.router.navigate(['/admin']);
        }
        else
        {
          this.router.navigate(['/mytasks']);
        }
        console.log('Successful login');
      },
      error: (error) => {
        console.log(error);
        console.log('Unsuccessful login');
        this.toastr.error(error.error)
      },
    });
  }
}
