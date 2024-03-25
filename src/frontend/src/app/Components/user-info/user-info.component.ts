import { UploadService } from '../../_services/upload.service';
import { ChangeDetectionStrategy, Component, Input, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserinfoService } from '../../_services/userinfo.service';
import { AppUser } from '../../Entities/AppUser';
import { ChangePassword } from '../../Entities/ChangePassword';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  public userInfo:any;
  public role:any;
  public profilePic:any;
  public passwordCheck:any;
  public defaulturl="../../../assets/profile_photo_placeholders/1234.png";
  public url="../../../assets/profile_photo_placeholders/1234.png";
  newData: ChangePassword = {
    CurrentPassword:""
  }

  constructor(private userinfoService: UserinfoService, private router: Router,private uploadservice:UploadService) {}
  visibility_change(type:string,div:any){
    if(div!=null) div.style.display = type;
  }

  ngOnInit(){
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
          if(this.userInfo.role == 1){
            this.role="Project manager";
          }else if(this.userInfo.role == 2){
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
        var succ = document.getElementById("successtext")
        if(succ) succ.style.display='block';
        var base = document.getElementById("basetext");
        if(base) base.style.display='none';
        var change = document.getElementById("Change_alert");
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

  imageWidth = signal(0);
  @Input() set width(val:number){
    this.imageWidth.set(val);
  }
  imageHeight = signal(0);
  @Input() set height(val:number){
    this.imageHeight.set(val);
  }

  imageSelected(event:any){
    const imageData:File = event.target.files[0];
    if(imageData != null){
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
      console.log("no image data.");
    }
  }
}
