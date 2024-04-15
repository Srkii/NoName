import { Router } from '@angular/router';
import { UserinfoService } from '../../_services/userinfo.service';
import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../_services/notifications.service';
import { Notification } from '../../Entities/Notification';
import { UploadService } from '../../_services/upload.service';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {

  constructor(private router: Router,private userInfo:UserinfoService, private uploadService:UploadService,public notificationService:NotificationsService) {}
  ngOnInit(): void {
    this.isAdmin()
    this.getUser()
    this.notificationService.createHubConnection();
  }
  admin!: boolean
  logovan!: boolean
  user!:any

  imgFlag: boolean=false;
  notification_list:any;
  async Logout(): Promise<void> {
    try {
      // Remove token and id from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('role');

      // Navigate to the login page
      this.notificationService.stopHubConnection();
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
        if(this.user.profilePicUrl!='' && this.user.profilePicUrl!=null)
        {
          this.uploadService.getImage(this.user.profilePicUrl).subscribe(
            { next:(res)=>{
              const reader=new FileReader();
              reader.readAsDataURL(res);
              reader.onloadend=()=>{
                this.user.url=reader.result as string;
                this.imgFlag=true;
            }}

        })
      }
      }

    })
  }

}
