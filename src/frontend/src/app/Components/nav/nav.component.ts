import { Router } from '@angular/router';
import { UserinfoService } from './../../Services/userinfo.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {

  constructor(private router: Router) {}
  ngOnInit(): void {
    this.isAdmin()
  }
  admin!: boolean
  logovan!: boolean

  async Logout(): Promise<void> {
    try {
      // Remove token and id from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('role');

      // Navigate to the login page
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('redirect failed:', error);
    }
  }

  isAdmin():boolean{
   return localStorage.getItem('role')==='0';
  }

}
