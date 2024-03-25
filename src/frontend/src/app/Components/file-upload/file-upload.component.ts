import { UploadService } from './../../_services/upload.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  file:any;

  constructor(private readonly uploadService:UploadService){}

  fileDroppedHandler($event:any){
    const data:File = $event.target.files[0];
    if(data != null){

    }
  }
}
