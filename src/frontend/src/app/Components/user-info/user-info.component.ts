import { UploadService } from '../../_services/upload.service';
import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { UserinfoService } from '../../_services/userinfo.service';
import { ChangePassword } from '../../Entities/ChangePassword';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  public userInfo:any;
  public oldPass="";
  public newpas="";
  public confirmpass="";
  public role:any;
  public profilePic:any;
  public defaulturl="../../../assets/profile_photo_placeholders/1234.png";
  public url="../../../assets/profile_photo_placeholders/1234.png";
  newData: ChangePassword = {
    CurrentPassword:""
  }

  constructor(private userinfoService: UserinfoService, private router: Router,private uploadservice:UploadService, private spinner:NgxSpinnerService) {}
  visibility_change(type:string,div:any){
    if(div!=null) div.style.display = type;
  }

  ngOnInit(){
    this.spinner.show();
    this.UserInfo();
    this.spinner.hide();
  }
  
  UserInfo(){
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('token')
    if (token) {
      this.userinfoService.getUserInfo(id,token).subscribe({
        next: (response) =>{
          this.userInfo = response;
          console.log(response);
          if(response.profilePicUrl!=null)
          {
            this.uploadservice.getImage(response.profilePicUrl)
            .subscribe(response => {
              const reader = new FileReader();
              reader.readAsDataURL(response);
              reader.onloadend = () =>{
                this.url = reader.result as string;
              };
            },
            error=>{
              console.error("Error loading image",error);
            });
          }
          if(this.userInfo.role == 2){
            this.role="Project manager";
          }else if(this.userInfo.role == 1){
            this.role="Member";
          }else this.role="Admin";
        },
        error: (error) => {
          console.log(error);
          console.log("GET USER INFO FAILED");
        }
      });
    }else {
      console.error("Token not found in local storage");
    }
  }
  passwordMatch(): boolean {
    return this.newData.NewPassword === this.confirmpass;
  }

  apply_changes(){
    console.log("applying changes...");
    var id= Number(localStorage.getItem('id'));
    var token = localStorage.getItem('token');
    this.userinfoService.updateUserInfo(token,id,this.newData).subscribe({
      next: (response) => {
        console.log(response);
        console.log("change info successful!");
        var succ = document.getElementById("success_div")
        if(succ) succ.style.display='block';
        var base = document.getElementById("warning_div");
        if(base) base.style.display='none';
        var change = document.getElementById("alert_div");
        if(change){
          change.style.backgroundColor = '#83EDA1'
          change.style.color = '#FFFFFF';
        }
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
      if(imageData && imageData.type.startsWith('image/')){
        var id = Number(localStorage.getItem('id'));
        var token = localStorage.getItem('token');
        this.uploadservice.UploadImage(id,imageData,token).subscribe({
          next: (response) => {
            console.log("RESPONSE",response);
            location.reload();
          },
          error: (error) =>{
            console.log(error);
          }
        });
      }
      else{
        console.log("file uploaded is not an image.");
      }
    }
    else{
      console.log("no image data.");
    }
  }
}
