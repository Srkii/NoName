import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../_services/register.service';
import { AppUser } from '../../Entities/AppUser';
import { ActivatedRoute, Router } from '@angular/router';
import { Invintation } from '../../Entities/Invitation';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  newUser: AppUser = {
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    Token: '',
  };
  Invintation: Invintation = {
    Email: '',
    Token: '',
  };
  confirmPassword: string = '';

  constructor(
    private registerService: RegisterService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  token: any;
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.toString();
    console.log('Token from URL:', this.token);
    this.GetEmailByToken(this.token);
  }

  GetEmailByToken(token: string | null): void {
    if (!token) {
      console.error('Token is missing');
      return;
    }

    this.registerService.getEmailByToken(token).subscribe({
      next: (response: any) => {
        console.log(response);
        const email = response?.email;
        if (email) {
          this.newUser.Email = email;
        } else {
          console.error('Email not found in response');
        }
      },
      error: (error) => {
        console.error('Error fetching email:', error);
      },
    });
  }

  Register(): void {
    if (this.newUser.Password !== this.confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    this.newUser.Token = this.token;

    this.registerService.register(this.newUser).subscribe({
      next: (response) => {
        localStorage.setItem('id', response.id);
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        console.log('Successful registration');
        this.router.navigate(['/mytasks']);
      },
      error: () => {
        this.toastr.error('Unsuccessful registration');
      },
    });
  }

  passwordMatch(): boolean {
    return this.newUser.Password === this.confirmPassword;
  }

  disableRightClick(event: MouseEvent): void {
    event.preventDefault();
  }
}
