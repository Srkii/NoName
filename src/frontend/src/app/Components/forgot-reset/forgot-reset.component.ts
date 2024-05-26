import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MailresetService } from '../../_services/mailreset.service';
import { ResetRequest } from '../../Entities/ResetRequest';
import { ThemeServiceService } from '../../_services/theme-service.service';

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

  constructor(
    private mailresetService: MailresetService,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeServiceService
    ) { }

  toggleTheme() {
    this.themeService.switchTheme();
  }

  token: any;
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.toString();
    this.GetEmailByToken(this.token)
  }

  GetEmailByToken(token: string | null): void {
    if (!token) {
      console.error('Token is missing');
      return;
    }
    this.mailresetService.getEmailByToken(token).subscribe({
      next: (response: any) => {
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
      return;
    }
    this.newRequest.Token = this.token;
    this.mailresetService.resetPassword(this.newRequest).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => console.log('Could not reset password')
    })
  }

  passwordMatch(): boolean {
    return this.newRequest.NewPassword === this.confirmPassword;
  }

  disableRightClick(event: MouseEvent): void {
    event.preventDefault();
  }
}
