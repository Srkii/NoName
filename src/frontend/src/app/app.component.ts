import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from './_services/shared.service';
import { firstValueFrom } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationsService } from './_services/notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'frontend';

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    public notificationService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.isTokenValid()
    this.isLoginOrRegisterPage()
  }

  isLoginOrRegisterPage(): boolean {
    return this.router.url === '/login' || this.router.url.startsWith('/landing') || this.router.url.startsWith('/register') || this.router.url === '/forgotpass' || this.router.url.startsWith('/forgotreset') ;
  }

  async isTokenValid(): Promise<void> {
    this.spinner.show()
    var token = localStorage.getItem("token");
    if (token) {
        var valid = await firstValueFrom(this.sharedService.IsTokenValid(token));
        if(!valid)
        {
          localStorage.removeItem('token');
          localStorage.removeItem('id');
          localStorage.removeItem('role');
          this.router.navigate(['/login'])
        }
        this.spinner.hide()
    }
  }
}
