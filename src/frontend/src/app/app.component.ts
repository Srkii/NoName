import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  constructor(private router: Router) {}

  isLoginOrRegisterPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/register' || this.router.url === '/forgotpass' || this.router.url === '/forgotreset' ;
  }
}
 