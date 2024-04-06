import { Component, OnInit } from '@angular/core';
import { MailReset } from '../../Entities/MailReset';
import { MailresetService } from '../../_services/mailreset.service';
@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrl: './forgot-pass.component.css'
})
export class ForgotPassComponent implements OnInit{
  
  resetEmail: MailReset = {
    Receiver: ''
  };
  emailSent: boolean = false;
  constructor(private mailreset: MailresetService) { }

  ngOnInit(): void { }

  sendResetLink() {
    this.mailreset.sendResetLink(this.resetEmail).subscribe({
      next: response => {
        console.log(response);
        this.emailSent = true;
      },
      error: error => { console.log(error); }
    })
  }
}
