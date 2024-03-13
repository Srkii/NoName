import { Component } from '@angular/core';

import { AdminService } from '../../Services/admin.service';
import { Invatation } from '../../Entities/Invatation';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

  constructor(private adminService:AdminService ){}

  receiverEmail: string=''

  invatation:Invatation={
    reciever: ''
  }

  Invite(): void{
    if(this.receiverEmail)
    {
      this.adminService.sendInvatation(this.receiverEmail).subscribe(
        ()=>{
          console.log('Email sent successfully');
        }
      )
    }
    error:()=>{
      console.log("Email is not sent")
    }}
    
  }

