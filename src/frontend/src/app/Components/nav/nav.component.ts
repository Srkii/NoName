import { Router } from '@angular/router';
import { UserinfoService } from '../../_services/userinfo.service';
import { Component, OnInit } from '@angular/core';
import { AppUser } from '../../Entities/AppUser';
import { NotificationsService } from '../../_services/notifications.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {

  constructor(private router: Router,private userInfo:UserinfoService,public notifications:NotificationsService) {}
  ngOnInit(): void {
    this.isAdmin()
    this.getUser()
  }
  admin!: boolean
  logovan!: boolean

  user!:any

  async Logout(): Promise<void> {
    try {
      // Remove token and id from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('role');

      // Navigate to the login page
      this.notifications.stopHubConnection();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('redirect failed:', error);
    }
  }

  isAdmin(): boolean {
   return localStorage.getItem('role')==='0';
  }

  isProjectManager(): boolean {
    return localStorage.getItem('role')==='2';
  }

  getUser(): void{
    var id=localStorage.getItem('id')
    this.userInfo.getUserInfo2(id).subscribe({
      next:(response)=>{
        this.user=response;
      },error:(error)=>{
        console.log(error)
      }

    })
  }

}
