import { UploadService } from './../../_services/upload.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {

  constructor(private readonly uploadService:UploadService){}
  fileInputHandler($event:any){
    var file:File = $event.target.files[0];
    var task_id = localStorage.getItem('selected_task');//ne znam sta ovde da radim..
    var token = localStorage.getItem('token');
    if(file!=null)
    {
      this.uploadService.UploadFile(task_id,file,token).subscribe({
        next: (response) =>{
          console.log(response);
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
