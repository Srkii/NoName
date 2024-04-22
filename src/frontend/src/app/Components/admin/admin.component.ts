import { Component, HostListener, OnInit, TemplateRef } from '@angular/core';

import { AdminService } from '../../_services/admin.service';
import { RegisterInvitation } from '../../Entities/RegisterInvitation';
import { Member, UserRole } from '../../Entities/Member';
import { ChangeRole } from '../../Entities/ChangeRole';
import { UpdateUser } from '../../Entities/UpdateUser';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from '../../_services/upload.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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

  constructor(private adminService: AdminService, private toastr: ToastrService, private uploadservice:UploadService, private spinner:NgxSpinnerService,private modalService:BsModalService){}

  ngOnInit(): void {
   this.onLoad();
   this.numbersOfRoles();
   this.PicturesOfRoles();
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

  userRole: string='';

  changeRole: ChangeRole={
    Id:0,
    Role: 0
  }

  numberOfRoles!: number

  updateUser: UpdateUser={
    FirstName: '',
    LastName: '',
    Email: ''
  }
  newFisrtName: string='';
  newLastName: string='';
  newEmail: string='';

  selectedRolee: string=''

  sortOrder: 'asc' | 'desc' = 'asc';

  pageNumber: number = 1;
  pageSize: number = 5;
  totalPages: number=0;
  currentPage: number=1;
  totalusersArray: number[] = [];

  userCount: number=0;
  filteredUsers: number=0;
  allUsersCount: number=0;

  searchTerm: string='';

  modalRef?: BsModalRef;

  curentUserId: number=0

  currentId=localStorage.getItem('id');

  isFilterActive: boolean=true;

  Invite(): void{
    this.spinner.show();
    if(this.invitation)
    {
      this.adminService.sendInvatation(this.invitation).subscribe(
        (response)=>{
          this.toastr.success(response.message);
          this.spinner.hide();
        }
      )
    }

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

    ChangeUserRole(id:number): void{
      this.changeRole.Id=id;
      const ChangeDto={
        Id:id,
        Role: parseInt(this.userRole)
      }
      if(ChangeDto)
      {
        console.log(ChangeDto)
        this.adminService.changeUserRole(ChangeDto).subscribe({next:(response)=>{
          this.GetUsers()
        },error: (error)=>{
          console.log(error)
        }}
        )
      }
      else{
        console.log("Can't change user role")
      }}

    UpdateUser(id: number): void{
      const updateeUser={
        Email: this.newEmail,
        FirstName: this.newFisrtName,
        LastName: this.newLastName
      }
      if(updateeUser){
        this.adminService.updateUser(id,updateeUser).subscribe(
          (response)=>{
            this.GetUsers()
          }
        )
      }
    }

    ArchiveUser(id:number): void{
      this.adminService.archiveUser(id).subscribe(
        (response)=>{
          this.GetUsers()
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

    GetUsers(): void {
      this.adminService.getAllUsers1(this.currentPage, this.pageSize,this.selectedRolee, this.searchTerm).subscribe(response => {
        this.allUsers = response;
        this.loadPicture(this.allUsers);
        this.adminService.getFilterCount(this.selectedRolee).subscribe(response=>{
          this.filteredUsers=response;
          this.totalPages= Math.ceil(this.filteredUsers / this.pageSize);
        this.totalusersArray= Array.from({ length: this.totalPages }, (_, index) => index + 1);
        });

        this.spinner.hide();
      });
    }

    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        const id = localStorage.getItem('id');
      this.GetUsers();
      }
    }

    previousPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
        const id = localStorage.getItem('id');
      this.GetUsers();
      }
    }
    goToPage(pageNumber: number): void {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
        const id = localStorage.getItem('id');
      this.GetUsers();
      }
    }

    filterUsers():void{
      this.currentPage=1;
      this.GetUsers();
    }

    //metoda za prikaz slike
    loadPicture(usersArray:Member[]) : void{
      usersArray.forEach(user => {
        if(user.profilePicUrl!='' && user.profilePicUrl!=null){
          this.uploadservice.getImage(user.profilePicUrl).subscribe(
            url => {
              user.url = url;
            }
          )
      }
    });

    }

    onLoad(): void{
      this.adminService.getAllUsers2().subscribe(response=>{
        this.allUsersCount=response;
      })
      this.adminService.getAllUsers1(this.currentPage, this.pageSize,this.selectedRolee, this.searchTerm).subscribe(response => {
        this.allUsers = response;
        this.loadPicture(this.allUsers);
        this.filteredUsers=this.allUsersCount;
        this.totalPages= Math.ceil(this.allUsersCount / this.pageSize);
        this.totalusersArray= Array.from({ length: this.totalPages }, (_, index) => index + 1);
        this.spinner.hide();
      });

    }

    numbersOfRoles():void{
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

    PicturesOfRoles():void{
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

    openModal(modal: TemplateRef<void>, userId: number)
    {
      this.curentUserId=userId;
      this.modalRef = this.modalService.show(
        modal,
        {
          class: 'modal-sm modal-dialog-centered'
        });
    }

    noFilter():void
    {
      this.selectedRolee='';
      this.onLoad();
    }

    currentUser(id:number):boolean{
      var id1=id.toString();
      if(this.currentId===id1)
        return false
      else return true
      
    }

    toogleFilter(): void{
      if(this.isFilterActive)
      {
        this.filterUsers();
      }
      else{
        this.noFilter();
      }
      this.isFilterActive=!this.isFilterActive;
    }

    

  }

