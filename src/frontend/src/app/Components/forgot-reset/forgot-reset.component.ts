import { Component, OnInit } from '@angular/core';
import { AppUser } from '../../Entities/AppUser';
import { ActivatedRoute, Router } from '@angular/router';
import { MailresetService } from '../../_services/mailreset.service';
import { ResetRequest } from '../../Entities/ResetRequest';

@Component({
  selector: 'app-forgot-reset',
  templateUrl: './forgot-reset.component.html',
  styleUrl: './forgot-reset.component.css'
})
export class ForgotResetComponent implements OnInit{
  
  newRequest: ResetRequest = {
    Email: '',
    Token: '',
    NewPassword: '',
  };
  confirmPassword: string = '';

  constructor(private mailresetService: MailresetService, private router: Router, private route: ActivatedRoute) { }

  token: any;
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.toString();
    console.log('Token from URL:', this.token);
    this.GetEmailByToken(this.token)
  }

  GetEmailByToken(token: string | null): void {
    if (!token) {
      console.error('Token is missing');
      return;
    }
    this.mailresetService.getEmailByToken(token).subscribe({
      next: (response: any) => {
        console.log(response);
        const email = response?.email;
        if (email) {
          this.newRequest.Email = email;
        } else {
          console.error('Email not found in response');
        }
      },
      error: (error) => {
        console.error('Error fetching email:', error);
      },
    });
  }

  resetPassword() {
    if (this.newRequest.NewPassword !== this.confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    this.newRequest.Token = this.token;
    this.mailresetService.resetPassword(this.newRequest).subscribe({
      next: () => {
        console.log('Password reseted');
        this.router.navigate(['/login']);
      },
      error: () => console.log('Could not reset password')
    })
  }

  passwordMatch(): boolean {
    return this.newRequest.NewPassword === this.confirmPassword;
  }
}
