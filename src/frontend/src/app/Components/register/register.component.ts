import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../_services/register.service';
import { AppUser } from '../../Entities/AppUser';
import { ActivatedRoute, Router } from '@angular/router';
import { Invintation } from '../../Entities/Invitation';
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
    private route: ActivatedRoute
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
        const email = response?.email; // Change this line according to your API response structure
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
      // You can show an error message or handle the mismatch as needed
      return;
    }
    this.newUser.Token = this.token;

    // If passwords match, proceed with registration
    this.registerService.register(this.newUser).subscribe({
      next: (response) => {
        console.log(response.id);
        console.log(response)
        localStorage.setItem('id', response.id);
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        console.log('Successful registration');
        this.router.navigate(['/mytasks']);
      },
      error: () => {
        console.log('Unsuccessful registration');
      },
    });
  }

  // Function to check if password and confirm password match
  passwordMatch(): boolean {
    return this.newUser.Password === this.confirmPassword;
  }
}
