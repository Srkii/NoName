import { UploadService } from './../../_services/upload.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {

  constructor(private readonly uploadService:UploadService){}
  fileDroppedHandler($event:any){
    console.log("Xd");
    var file = $event.target.files[0];
    console.log(file);
  }
}
