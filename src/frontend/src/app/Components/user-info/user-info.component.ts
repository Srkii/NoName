import { UploadService } from '../../_services/upload.service';
import { Component, OnInit, TemplateRef} from '@angular/core';
import { UserinfoService } from '../../_services/userinfo.service';
import { ChangePassword } from '../../Entities/ChangePassword';
import { NgxSpinnerService } from 'ngx-spinner';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BsModalRef,BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { ToastrService } from 'ngx-toastr';
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
  public showSuccess: boolean = false;
  public showError: boolean = false;

  isDropdownOpen = false;
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  newData: ChangePassword = {
    CurrentPassword:""
  }

  constructor(
    private userinfoService: UserinfoService,
    public uploadService:UploadService,
    private spinner:NgxSpinnerService,
    private modalService:BsModalService,
    private toast:ToastrService
    ) {}
  
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
          // console.log(response);
          if(this.userInfo.role == 2){
            this.role="Project manager";
          }else if(this.userInfo.role == 1){
            this.role="Member";
          }else this.role="Admin";
        },
        error: (error) => {
          // console.log(error);
          // console.log("GET USER INFO FAILED");
        }
      });
    }else {
      console.error("Token not found in local storage");
    }

  }
  passwordMatch(): boolean {
    return this.newData.NewPassword === this.confirmpass;
  }

  apply_changes() {
    var id = Number(localStorage.getItem('id'));
    var token = localStorage.getItem('token');
    this.userinfoService.updateUserInfo(token, id, this.newData).subscribe({
      next: () => {
        this.showSuccess = true;
        this.showError = false;
      },
      error: (error) => {
        this.toastr.error(error.error);
        this.showSuccess = false;
        this.showError = true;
      }
    });
  }

  imgChangeEvt: any = '';
  cropImgPreview: any = '';
  imageName: any = '';
  modalRef?:BsModalRef;
  removeModalRef?:BsModalRef;
  viewModalRef?:BsModalRef;
  onImageSelected(event: any,modal:TemplateRef<void>): void {
      this.imgChangeEvt = event;
      this.imageName = event.target.files[0].name.split('.')[0];
      if(this.uploadService.isSelectedFileImage(event.target.files[0])){
        this.modalRef = this.modalService.show(
          modal,
          {
            class:'modal-face modal-sm modal-dialog-centered',
          }
        )
      }else{
        this.toast.error("Please upload an image.");
      }
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
      // console.log("crop failed...");
  }
  uploadCroppedImage(){
    this.spinner.show();
    var id = localStorage.getItem('id');
    var token = localStorage.getItem('token');
    var imageFile =  new File([this.cropImgPreview],id+"-"+this.imageName+'-userimg.png',{type: 'image/png'});
    this.uploadService.UploadImage(id,imageFile,token).subscribe({
      next: (response) => {
        // console.log('Image uploaded successfully', response);
        this.spinner.hide();
        location.reload();
      },
      error: (error) => {
        // console.error('Error uploading image', error);
      }
    });

  }
  removeImageModal(modal:TemplateRef<void>):void{
    this.removeModalRef = this.modalService.show(
      modal,
      {
        class:'modal-face modal-sm modal-dialog-centered',
      }
    )
  }
  viewImageModal(modal:TemplateRef<void>):void{
    this.viewModalRef = this.modalService.show(
      modal,
      {
        class:'modal-face modal-sm modal-dialog-centered',
      }
    )
  }
  removeImage(){
    this.removeModalRef?.hide();
    this.spinner.show();
    var id = localStorage.getItem('id');
    var token = localStorage.getItem('token');
    this.uploadService.removePfp(id,token).subscribe({
      next: () => {
        this.spinner.hide();
        location.reload();
      },
      error: (error) => {
        // console.error(error);
      }
    });
  }
}
