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

  regexName: RegExp = /^[A-Za-z]{2,}$/;
  regexPassword: RegExp = /^[A-Za-z]{2,}$/;
  invalidFirstName: boolean = false;
  invalidLastName: boolean = false;
  invalidPassword: boolean = false;

  constructor(
    private registerService: RegisterService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  token: any;
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.toString();
    this.GetEmailByToken(this.token);
  }

  GetEmailByToken(token: string | null): void {
    if (!token) {
      console.error('Token is missing');
      return;
    }

    this.registerService.getEmailByToken(token).subscribe({
      next: (response: any) => {
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

    if(this.newUser.FirstName && !this.regexName.test(this.newUser.FirstName))
    {
      this.invalidFirstName = true;
      return;
    }
    this.invalidFirstName = false;
    if(this.newUser.LastName && !this.regexName.test(this.newUser.LastName))
    {
      this.invalidLastName = true;
      return;
    }
    this.invalidLastName = false;
    if(this.newUser.Password && this.newUser.Password.length < 5)
    {
        this.invalidPassword = true;
        return;
    }
    this.invalidPassword = false;
    if (this.newUser.Password !== this.confirmPassword) {
      return;
    }
    
    this.newUser.Token = this.token;

    this.registerService.register(this.newUser).subscribe({
      next: (response) => {
        localStorage.setItem('id', response.id);
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
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
