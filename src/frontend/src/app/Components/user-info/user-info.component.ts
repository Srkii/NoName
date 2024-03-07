import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserinfoService } from './../../Services/userinfo.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  public userInfo: any;

  constructor(private userinfoService: UserinfoService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    const token = localStorage.getItem('id');
    if (token) {
      this.userInfo = await this.userinfoService.getUserInfo(token);
    } else {
      console.error("Token not found in local storage");
    }
  }

  async onClickUser(): Promise<void> {
    if (this.router.url === '/userinfo') return;
    try {
      await this.router.navigate(['/userinfo']);
    } catch (error) {
      console.error("Redirect failed:", error);
    }
  }

  async onClickHome(): Promise<void> {
    if (this.router.url === '/home') return;
    try {
      await this.router.navigate(['/home']);
    } catch (error) {
      console.error("Redirect failed:", error);
    }
  }
}
