import { SharedService } from '../../_services/shared.service';
import { UploadService } from './../../_services/upload.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {

  constructor(private readonly uploadService:UploadService,private readonly shared:SharedService){}
  fileInputHandler($event:any){
    var file:File = $event.target.files[0];
    var task_id = Number(this.shared.current_task_id);
    var token = localStorage.getItem('token');
    var user_id = localStorage.getItem('id');//prosledim id posiljaoce
    if(file!=null && this.shared.current_task_id!=null)
    {
      this.uploadService.UploadFile(task_id,user_id,file,token).subscribe({
        next: (response) =>{
          
        },
        error:(error) =>{
          console.log(error);
        }
      });
    }
    else{
      console.log("no file data");
    }
  }
}
