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

  invatation:Invatation={
    reciever: ''
  }

  Invite(): void{
    this.adminService.sendInvatation(this.invatation).subscribe({next:(res)=>{
      console.log("Email successful sent")
    },error:()=>{
      console.log("Email is not sent")
    }})
  }
}
