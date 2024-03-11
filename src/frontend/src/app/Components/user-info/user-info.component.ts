import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserinfoService } from './../../Services/userinfo.service';
import { AppUser } from '../../Entities/AppUser';
import { ChangeUserData } from '../../Entities/ChangeUserData';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  public userInfo: any;
  public passwordCheck:any;
  newData: ChangeUserData = {
    ConfirmOldPass:""//ostale vrednosti su nullable
  }

  constructor(private userinfoService: UserinfoService, private router: Router) {}
  //postavljanje defaultne vidljivosti div-ova

  visibility_change(type:string,div:any){//promena vidljivosti div-a
    if(div!=null) div.style.display = type;
  }

  async ngOnInit(): Promise<void> {

    this.visibility_change('none',document.getElementById("update"));

    const id = localStorage.getItem('id');
    const token = localStorage.getItem('token')
    if (token) {
      this.userInfo = await this.userinfoService.getUserInfo(id,token);
      console.log(this.userInfo.email)
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

    change_info(){
      this.visibility_change('block',document.getElementById('update'));
    }
    apply_changes(){
      if(this.newData.ConfirmOldPass==''){
        alert("input old password for verification...");
        return;
      }else if(this.newData.NewPass!=this.newData.ConfirmNewPass){
        alert("passwords must match...");
        return;
      }
      console.log("applying changes...");
      console.log("DATA TO UPDATE: ",this.newData);
      var id = localStorage.getItem('id');
      var token = localStorage.getItem('token');
      var response = this.userinfoService.updateUserInfo(this.newData,id,token);
      if(response == null) alert("Change failed, invalid data..");
      alert("Update successfull!");
    }

}
