import { Component, OnInit } from '@angular/core';

import { AdminService } from '../../_services/admin.service';
import { Invatation } from '../../Entities/Invatation';
import { Member } from '../../Entities/Member';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit{

  constructor(private adminService:AdminService ){}
  ngOnInit(): void {
    this.GetAllUsers()
   
  }

  invatation:Invatation={
    receiver: ''
  }

  allUsers: Member[]=[]

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

    GetAllUsers(): void{
      this.adminService.getAllUsers().subscribe({next:(response)=>{
        this.allUsers=response
        console.log(response)
        console.log(this.allUsers)
        this.print()
      },error:(error)=>{
        console.log(error)
      }})
    }

    print():void{
      console.log(this.allUsers)
      this.allUsers.forEach(user => {
        console.log(`${user?.email} ${user?.lastName}`);
    });
    }
    
  }

