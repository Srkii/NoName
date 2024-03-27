import { Component, OnInit } from '@angular/core';

import { AdminService } from '../../_services/admin.service';
import { Invatation } from '../../Entities/Invatation';
import { Member, UserRole } from '../../Entities/Member';
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

  admins: Member[]=[]
  members: Member[]=[]
  projectMangers: Member[]=[]

  numberOfRoles!: number

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
      },error:(error)=>{
        console.log(error)
      }})
    }

    GetUserRole(role: UserRole): string{
        switch(role){
          case UserRole.Admin:
            return "Admin"
          case UserRole.Member:
            return "Member"
          case UserRole.ProjectManager:
            return "Project Manager"
          default:
            return ''
        }
    }

    SplitByRole(): void{
      this.allUsers.forEach((user)=>{
        if(user.role===UserRole.Admin){
          this.admins.push(user)
        }
        else if(user.role===UserRole.Member)
        {
          this.members.push(user)
        }
        else if(user.role===UserRole.ProjectManager)
          this.projectMangers.push(user)
      })
    }
 
  }

