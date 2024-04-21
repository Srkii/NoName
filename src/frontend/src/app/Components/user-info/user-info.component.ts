import { ApiUrl } from './../../ApiUrl/ApiUrl';
import { UploadService } from '../../_services/upload.service';
import { Component, OnInit, TemplateRef} from '@angular/core';
import { UserinfoService } from '../../_services/userinfo.service';
import { ChangePassword } from '../../Entities/ChangePassword';
import { NgxSpinnerService } from 'ngx-spinner';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BsModalRef,BsModalService } from 'ngx-bootstrap/modal';
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

  constructor(
    private userinfoService: UserinfoService,
    public uploadService:UploadService,
    private spinner:NgxSpinnerService,
    private modalService:BsModalService
    ) {}
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

  imgChangeEvt: any = '';
  cropImgPreview: any = '';
  imageName: any = '';
  modalRef?:BsModalRef;

  onImageSelected(event: any,modal:TemplateRef<void>): void {
      this.imgChangeEvt = event;
      this.imageName = event.target.files[0].name.split('.')[0];
      console.log(this.imageName);
      this.modalRef = this.modalService.show(
        modal,
        {
          class:'modal-face modal-sm modal-dialog-centered',
        }
      )
  }
  cropImg(event: ImageCroppedEvent) {
    this.cropImgPreview = event.blob;
  }

  imgLoad() {
      // display cropper tool
  }

  initCropper() {
      // init cropper
  }

  imgFailed() {
      // error msg\
      console.log("crop failed...");
  }
  uploadCroppedImage(){
    var id = localStorage.getItem('id');
    var token = localStorage.getItem('token');
    var imageFile =  new File([this.cropImgPreview],id+"-"+this.imageName+'-userimg.png',{type: 'image/png'});
    console.log(imageFile);
    this.uploadService.UploadImage(id,imageFile,token).subscribe({
      next: (response) => {
        console.log('Image uploaded successfully', response);
      },
      error: (error) => {
        console.error('Error uploading image', error);
      }
    });
    this.modalRef?.hide();
    setTimeout(() => {
      location.reload();
    },2000);

  }
}
