import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'frontend';

  constructor(private router: Router) {}
  ngOnInit(): void {
    this.isLoginOrRegisterPage()
  }

  isLoginOrRegisterPage(): boolean {
    return this.router.url === '/login' || this.router.url.startsWith('/landing') || this.router.url.startsWith('/register') || this.router.url === '/forgotpass' || this.router.url.startsWith('/forgotreset') ;
  }
}