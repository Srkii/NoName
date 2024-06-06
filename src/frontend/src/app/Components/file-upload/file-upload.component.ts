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
  
}