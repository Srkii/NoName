import { Component } from '@angular/core';

import { AdminService } from '../../_services/admin.service';
import { Invatation } from '../../Entities/Invatation';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {

  constructor(private adminService:AdminService ){}

  invatation:Invatation={
    receiver: ''
  }

  Invite(): void{
    if(this.invatation)
    {
      this.adminService.sendInvatation(this.invatation).subscribe(
        (response)=>{
          console.log(response);
        }
      )
    }
    error:()=>{
      console.log("Email is not sent")
    }}
    
  }

