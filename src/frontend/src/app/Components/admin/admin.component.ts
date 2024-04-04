import { Component, HostListener, OnInit } from '@angular/core';

import { AdminService } from '../../_services/admin.service';
import { RegisterInvitation } from '../../Entities/RegisterInvitation';
import { Member, UserRole } from '../../Entities/Member';
import { ChangeRole } from '../../Entities/ChangeRole';
import { UpdateUser } from '../../Entities/UpdateUser';
import { ToastrService } from 'ngx-toastr';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  template: `
    <button (click)="refreshPage()">Refresh Page</button>
    <i class="fa fa-refresh" (click)="refreshPage()"></i>
  `,
})
export class AdminComponent implements OnInit{

  constructor(private adminService:AdminService,private toastr: ToastrService ){}
  ngOnInit(): void {
    this.GetAllUsers()
  }

  invitation:RegisterInvitation={
    receiver: ''
  }

  allUsers: Member[]=[]

  admins: Member[]=[]
  members: Member[]=[]
  projectMangers: Member[]=[]

  role!: number

  selectedRole!: UserRole;
  roles1 : string =''

  roles: UserRole[] = [UserRole.Admin, UserRole.Member, UserRole.ProjectManager];

  changeRole!: ChangeRole

  numberOfRoles!: number

  updateUser: UpdateUser={
    FirstName: '',
    LastName: '',
    Email: ''
  }

  flagA:boolean=false
  flagM:boolean=false
  flagPM:boolean=false

  sortOrder: 'asc' | 'desc' = 'asc';

  Invite(): void{
    if(this.invitation)
    {
      this.adminService.sendInvatation(this.invitation).subscribe(
        (response)=>{
          this.toastr.success(response.message);
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
    GetUserRole1(role: string): number{
      switch(role){
        case "Admin":
          return 0
        case "Member":
          return UserRole.Member
        case "Project manager":
          return UserRole.ProjectManager
        default:
          return UserRole.Member
      }
  }

    SplitByRole(): void{
      this.allUsers.forEach((user)=>{
        if(user.role===UserRole.Admin){
          this.admins.push(user)
          this.flagA=true
        }
        else if(user.role===UserRole.Member)
        {
          this.members.push(user)
          this.flagM=true

        }
        else if(user.role===UserRole.ProjectManager)
        {
          this.projectMangers.push(user)
          this.flagPM=true
        }

      })
    }

    ChangeUserRole(id:number): void{
      // this.changeRole.Role=this.GetUserRole(this.role)
      this.changeRole.Id=id;
      this.changeRole.Role=this.role
      console.log(this.changeRole.Role)
      if(this.changeRole)
      {
        console.log(this.changeRole)
        this.adminService.changeUserRole(this.changeRole).subscribe(
          (response)=>{
            console.log(response);
            this.GetAllUsers();
          }

        )

      }
      error:()=>{
        console.log("Can't change user role")
      }}

    UpdateUser(id: number): void{
      if(this.updateUser){
        this.adminService.updateUser(id,this.updateUser).subscribe(
          (response)=>{
            console.log(response)
            this.GetAllUsers();
          }
        )
      }
    }

    ArchiveUser(id:number): void{
      this.adminService.archiveUser(id).subscribe(
        (response)=>{
          console.log(response)
          this.GetAllUsers();
        }
      )

    }
    sortUsersByName(): void {
      if(this.sortOrder==='asc')
      {
      this.allUsers.sort((a, b) => {
        const fullNameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const fullNameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        if (fullNameA < fullNameB) return -1;
        if (fullNameA > fullNameB) return 1;
        return 0;
      });
      this.sortOrder = 'desc';
    }
    else{
      this.allUsers.sort((a, b) => {
        const fullNameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const fullNameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        if (fullNameA < fullNameB) return 1;
        if (fullNameA > fullNameB) return -1;
        return 0;
      });
      this.sortOrder = 'asc';
    }
    }


  }

