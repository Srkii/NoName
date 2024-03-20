import { UploadService } from './../../Services/upload.service';
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
  public profilePic:any;
  public passwordCheck:any;
  public defaulturl="../../../assets/1234.png";
  public url="../../../assets/1234.png";
  newData: ChangeUserData = {
    CurrentPassword:""
  }

  constructor(private userinfoService: UserinfoService, private router: Router,private uploadservice:UploadService) {}
  visibility_change(type:string,div:any){
    if(div!=null) div.style.display = type;
  }

  async ngOnInit(): Promise<void> {
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('token')
    if (token) {
      this.userInfo = await this.userinfoService.getUserInfo(id,token);
      this.profilePic = await this.userinfoService.getProfilePhoto(id,token);
      if(this.profilePic.url != null)this.url = this.profilePic.url;
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
    var changeinfodiv = document.getElementById('update');
    if(changeinfodiv!=null){
      this.visibility_change('block',changeinfodiv);
      setTimeout(function(){
        if(changeinfodiv!=null)changeinfodiv.style.opacity='1';
      },10);
    }
  }//nepotrebno


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
    this.userinfoService.updateUserInfo(token,id,this.newData).subscribe({
      next: (response) => {
        console.log(response);
        localStorage.clear();
        localStorage.setItem('id',response.id);
        localStorage.setItem('token',response.token);
        console.log("change info successful!");
        alert("Changes applied");
        location.reload();
      },
      error: (error)=>{
        console.log(error);
        console.log("change info failed.");
      }
    });
  }
  imageSelected(event:any){
    const imageData:File = event.target.files[0];
    if(imageData != null){
      var id = Number(localStorage.getItem('id'));
      var token = localStorage.getItem('token');
      var response = this.uploadservice.UploadImage(id,imageData,token);
    }
    else{
      console.log("no data...");
    }
  }
  onClickUpload(){
    document.getElementById("inp")?.click();
  }
  RemoveImage(){
    console.log("removing user profile picture...");
    if(this.url != "../../../assets/1234.png"){
      var id = localStorage.getItem('id');
      var token = localStorage.getItem('token');
      this.uploadservice.RemoveImage(id,token);
      this.url=this.defaulturl;
    }
  }
}
