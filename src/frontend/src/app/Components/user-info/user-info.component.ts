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
    CurrentPassword:""
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
    if(this.newData.CurrentPassword==''){
      alert("input old password for verification...");
      return;
    }else if(this.newData.NewPassword!=this.newData.NewPasswordConfirm){
      alert("passwords must match...");
      return;
    }
    console.log("applying changes...");
    var id= Number(localStorage.getItem('id'));
    var token = localStorage.getItem('token');
    this.userinfoService.updateUserInfo(token,id,this.newData)
    .then(response => {
      if(response.ok){
        alert("update successful!");
      }else{
        alert("update failed, invalid data...");
      }
    })
    .catch(error => {
      console.error("error in updating info: ",error);
      alert("update failed,try again later.");
    })
  }
}
