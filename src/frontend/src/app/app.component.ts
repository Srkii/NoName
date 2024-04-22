import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from './_services/shared.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'frontend';

  constructor(
    private router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.isTokenValid()
    this.isLoginOrRegisterPage()
  }

  isLoginOrRegisterPage(): boolean {
    return this.router.url === '/login' || this.router.url.startsWith('/landing') || this.router.url.startsWith('/register') || this.router.url === '/forgotpass' || this.router.url.startsWith('/forgotreset') ;
  }

  async isTokenValid(): Promise<void> {
    var token = localStorage.getItem("token");
    if (token) {
        var valid = await firstValueFrom(this.sharedService.IsTokenValid(token)) ?? false;
        if(!valid)
        {
          localStorage.removeItem('token');
          localStorage.removeItem('id');
          localStorage.removeItem('role');
          this.router.navigate(['/login'])
        }
    }
  }
}
