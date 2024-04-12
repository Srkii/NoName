import { Component, HostListener, OnInit } from '@angular/core';

import { AdminService } from '../../_services/admin.service';
import { RegisterInvitation } from '../../Entities/RegisterInvitation';
import { Member, UserRole } from '../../Entities/Member';
import { ChangeRole } from '../../Entities/ChangeRole';
import { UpdateUser } from '../../Entities/UpdateUser';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from '../../_services/upload.service';
import { NgxSpinnerService } from 'ngx-spinner';
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

  constructor(private adminService:AdminService,private toastr: ToastrService ,private uploadservice:UploadService,private spinner:NgxSpinnerService){}
  ngOnInit(): void {
   this.onLoad();
   this.byRole();
   this.byRole1();
  }

  invitation:RegisterInvitation={
    receiver: ''
  }

  allUsers: Member[]=[]

  admins: Member[]=[]
  members: Member[]=[]
  projectMangers: Member[]=[]

  numOfAdmins: number=0
  numOfMembers: number=0;
  numOfPM: number=0;

  role!: number

  selectedRole!: UserRole;
  roles1! : string;

  roles: UserRole[] = [UserRole.Admin, UserRole.Member, UserRole.ProjectManager];

  changeRole!: ChangeRole

  numberOfRoles!: number

  updateUser: UpdateUser={
    FirstName: '',
    LastName: '',
    Email: ''
  }

  isAdmin: string=''
  isMember: string=''
  isProjectManager: string=''

  selectedRolee: string=''

  sortOrder: 'asc' | 'desc' = 'asc';

  items: any[] = [];
  pageNumber: number = 1;
  pageSize: number = 5;
  totalPages: number=0;
  currentPage: number=1;
  totalusersArray: number[] = [];

  userCount: number=0;
  filteredUsers: number=0;
  allUsersCount: number=0;

  userRole: string='';

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
        this.allUsers=response;
        this.allUsers.forEach(user => {
          if(user.profilePicUrl!=null) {
            this.uploadservice.getImage(user.profilePicUrl).subscribe(
              response=>{
                const reader=new FileReader();
              reader.readAsDataURL(response);
              reader.onloadend=()=>{
                user.profilePicUrl=reader.result as string;
              };
            }
          )
        }});
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
          return UserRole.Admin;
        case "Member":
          return UserRole.Member
        case "Project manager":
          return UserRole.ProjectManager
        default:
          return UserRole.Member
      }
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
            this.loadItems()
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
            this.loadItems()
          }
        )
      }
    }

    ArchiveUser(id:number): void{
      this.adminService.archiveUser(id).subscribe(
        (response)=>{
          console.log(response)
          this.loadItems()
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

    loadItems(): void {
      this.adminService.getAllUsers1(this.currentPage, this.pageSize,this.selectedRolee).subscribe(response => {
        this.allUsers = response;
        this.allUsers.forEach(user => {
          if(user.profilePicUrl!=null) {
            this.uploadservice.getImage(user.profilePicUrl).subscribe(
              response=>{
                const reader=new FileReader();
              reader.readAsDataURL(response);
              reader.onloadend=()=>{
                user.url=reader.result as string;
              };
            }
          )
        }});
        this.adminService.getFilterCount(this.selectedRolee).subscribe(response=>{
          this.filteredUsers=response;
          console.log("filt"+this.filteredUsers);
        });
        // this.filteredUsers=this.userCount;
        this.totalPages= Math.ceil(this.filteredUsers / this.pageSize);
        this.totalusersArray= Array.from({ length: this.totalPages }, (_, index) => index + 1);
        console.log("nizzz"+this.totalusersArray)
        console.log(response);
        this.spinner.hide();
      });
    }

    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        const id = localStorage.getItem('id');
      this.loadItems();
      }
    }

    previousPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
        const id = localStorage.getItem('id');
      this.loadItems();
      }
    }
    goToPage(pageNumber: number): void {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
        const id = localStorage.getItem('id');
      this.loadItems();
      }
    }

    changePageSize(event: Event): void {
      const target = event.target as HTMLSelectElement;
      if (target.value !== '') {
        const pageSize = Number(target.value);
        this.pageSize = pageSize;
        this.loadItems();
      }
    }

    filterUsers():void{
      this.currentPage=1;
      this.loadItems();
    }

    // CountProjects(): void{
    //   this.adminService.getUsersCount(this.selectedRolee).subscribe(response=>{
    //     this.userCount=response;
    //     console.log(this.selectedRole+" "+ this.userCount)
    //     // return this.userCount;
    //   })
      // return 0;

    //}

    loadPicture(usersArray:Member[]) : void{
      usersArray.forEach(user => {
        if(user.profilePicUrl!=null){
        this.uploadservice.getImage(user.profilePicUrl).subscribe(
          { next:(res)=>{
            console.log(res)
            const reader=new FileReader();
            reader.readAsDataURL(res);
            reader.onloadend=()=>{
              user.url=reader.result as string;
          }}
          ,error:(error)=>{
            console.log(error);
          }}
        )
      }});

    }

    onLoad(): void{
      this.adminService.getAllUsers2().subscribe(response=>{
        this.allUsersCount=response;
      })
      this.adminService.getAllUsers1(this.currentPage, this.pageSize,this.selectedRolee).subscribe(response => {
        this.allUsers = response;
        this.loadPicture(this.allUsers);
        this.adminService.getAllUsers2().subscribe(
          response=>{
            this.allUsersCount=response;
          }
        )
        this.filteredUsers=this.allUsersCount;
        this.totalPages= Math.ceil(this.allUsersCount / this.pageSize);

        console.log("sss"+this.allUsersCount)
        console.log("aaaa"+this.totalPages)
        this.totalusersArray= Array.from({ length: this.totalPages }, (_, index) => index + 1);
        console.log("nizzz"+this.totalusersArray)
        console.log(response);
        this.spinner.hide();
      });

    }

    splitByRole(): void{
      this.allUsers.forEach(user => {
        if(user.role===UserRole.Admin)
        {
          this.admins.push(user);
        }
        if(user.role===UserRole.Member)
        {
          this.members.push(user);
        }
        if(user.role===UserRole.ProjectManager)
        {
          this.projectMangers.push(user);
        }

      });

    }

    byRole():void{
      this.adminService.getFilterCount("Admin").subscribe(res=>{
        this.numOfAdmins=res;
      })
      this.adminService.getFilterCount("Member").subscribe(res=>{
        this.numOfMembers=res;
      })
      this.adminService.getFilterCount("projectManager").subscribe(res=>{
        this.numOfPM=res;
      })
    }

    byRole1():void{
      this.adminService.getAllUsers3("Admin").subscribe(res=>{
        this.admins=res;
        this.loadPicture(this.admins);
      })
      this.adminService.getAllUsers3("Member").subscribe(res=>{
        this.members=res;
        this.loadPicture(this.members)
      })
      this.adminService.getAllUsers3("ProjectManager").subscribe(res=>{
        this.projectMangers=res;
        this.loadPicture(this.projectMangers);
      })
    }

  }

