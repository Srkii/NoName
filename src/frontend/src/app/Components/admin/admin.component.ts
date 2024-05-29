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
import { MyProjectsService } from '../../_services/my-projects.service';
import { Project } from '../../Entities/Project';
import { AppUser } from '../../Entities/AppUser';

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

  constructor(
    private adminService: AdminService, 
    private toastr: ToastrService, 
    public uploadservice:UploadService, 
    private spinner:NgxSpinnerService,
    private modalService:BsModalService,
    private myProjectsService: MyProjectsService,
  ){}

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
  curentEmail: string=''
  curentName: string=''
  currentLastName: string=''
  currentRole: string=''
  currentId=localStorage.getItem('id');
  selectedUserRole: UserRole | null = null;

  pmCounter: number = 0;
  pmProjects: Project[] = [];
  pmProjectCount: number = 0;
  projectManagers: AppUser[] = [];
  selectedManager: AppUser[] = [];

  isFilterActive: boolean=true;

  archived_users: Member[]=[];

  archivedIds:number[]=[];
  archId: boolean=false;
  invalidName: boolean=false;
  invalidLastName: boolean=false;
  invalidEmail: boolean=false;
  regex: RegExp = /^[A-Za-zĀ-ž]{2,}$/;
  regexEmail: RegExp =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  archMembers: { [key: string]: Member[] } = {};

  Invite(): void{
   
    if(this.invitation.receiver!='')
    {
      this.spinner.show();
      this.adminService.sendInvatation(this.invitation).subscribe(
        (response)=>{
          this.toastr.success(response.message);
          this.spinner.hide();
        }
      )
    }
    else{
      this.toastr.error("Email is not valid");
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
      
      if (this.newEmail==this.updateUser.Email && this.newFisrtName==this.updateUser.FirstName && this.newLastName == this.updateUser.LastName) {
        return;
      }

      if(!this.regex.test(this.newFisrtName) || !this.regex.test(this.newLastName) || !this.regexEmail.test(this.newEmail)){
        return;
      }

      this.updateUser.Email = this.newEmail;
      this.updateUser.FirstName = this.newFisrtName;
      this.updateUser.LastName = this.newLastName;
      
      this.adminService.updateUser(id,this.updateUser).subscribe({
        next:()=>{
          this.GetUsers();
          this.modalRef?.hide();
        },
        error: (error) => {
          console.log(error);
        }
    })
      
    }

    ArchiveUser(id:number): void{
      this.adminService.archiveUser(id).subscribe(
        (response)=>{
          if(this.currentPage>1 && this.totalPages==1)
            {
              this.currentPage=1;
            }
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
        var counnt=this.allUsers.length;
        this.adminService.getCount(this.selectedRolee, this.searchTerm).subscribe({next:(res)=>{
          this.filteredUsers=res;
          this.totalPages= Math.ceil(res / this.pageSize);
          if(this.currentPage>1 && this.totalPages==1)
            {
              this.currentPage=1;
              this.GetUsers();
              return;
            }
          this.totalusersArray= Array.from({ length: this.totalPages }, (_, index) => index + 1);
        
        }})

        this.spinner.hide();
      });
      this.getArchivedUsers();
    }

    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      this.GetUsers();
      }
    }

    previousPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
      this.GetUsers();
      }
    }
    goToPage(pageNumber: number): void {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
      this.GetUsers();
      }
    }

    filterUsers():void{
      this.currentPage=1;
      this.GetUsers();
    }

    //metoda za prikaz slike
    // loadPicture(usersArray:Member[]) : void{
    //   usersArray.forEach(user => {
    //     if(user.profilePicUrl!='' && user.profilePicUrl!=null){
    //       this.uploadservice.getImage(user.profilePicUrl).subscribe(
    //         url => {
    //           user.url = url;
    //         }
    //       )
    //   }
    // });

    onLoad(): void{
      this.adminService.getAllUsers2().subscribe(response=>{
        this.allUsersCount=response;
      })
      this.adminService.getAllUsers1(this.currentPage, this.pageSize,this.selectedRolee, this.searchTerm).subscribe(response => {
        this.allUsers = response;
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
        //this.loadPicture(this.admins);
      })
      this.adminService.getAllUsers3("Member").subscribe(res=>{
        this.members=res;
        //this.loadPicture(this.members)
      })
      this.adminService.getAllUsers3("ProjectManager").subscribe(res=>{
        this.projectMangers=res;
        //this.loadPicture(this.projectMangers);
      })
    }

    async loadPMInfo(user: Member){
      try
      {
        this.pmCounter = this.allUsers.filter((x:any) => x.role === 2).length
        this.pmProjects = await this.myProjectsService.getManagersProjects(user.id).toPromise();
        this.pmProjectCount = this.pmProjects.length;
        console.log(this.pmProjectCount)
        this.projectManagers = await this.myProjectsService.getManagers(user.id).toPromise();
      }
      catch(error){}
    }

    openModal(modal: TemplateRef<void>, user:Member)
    {
      this.newEmail = user.email;
      this.newFisrtName = user.firstName;
      this.newLastName = user.lastName;
      this.curentUserId=user.id;

      this.modalRef = this.modalService.show(
        modal,
        {
          class: 'modal-sm modal-dialog-centered'
        });
    }

    async openRoleModal(modal: TemplateRef<void>, user:Member)
    {
      this.selectedUserRole = user.role;
      this.curentUserId=user.id;
    
      if(user.role==0)
      {
        this.currentRole="Admin";
      }
      else if(user.role==1)
      {
        this.currentRole="Member"
      }
      else if(user.role==2)
      {
        await this.loadPMInfo(user);
        this.currentRole="Project Manager"
      }
      
      if(user.role != 2 || (user.role == 2 && this.pmProjectCount == 0 || this.pmCounter==1)){
        this.modalRef = this.modalService.show(
          modal,
          {
            class: 'modal-sm modal-dialog-centered'
          });
      }
      else{
        this.modalRef = this.modalService.show(
          modal,
          {
            class: 'modal-lg modal-dialog-centered'
          });
      }
    }

    openModal1(modal: TemplateRef<void>){
      this.getArchivedUsers();
      this.modalRef = this.modalService.show(
        modal,
        {
          class: 'modal-lg modal-dialog-centered'
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

    getArchivedUsers(): void{
      this.adminService.getArchivedUsers().subscribe({next:(res)=>{
        this.archived_users=res;
      },error:(error)=>{
        console.log(error);
      }
    })

    }

    putInArray(id:number): void{
      this.archivedIds.push(id);
    }

    removeFromArchived() : void{
      if(this.archivedIds!=null)
      {
        this.adminService.removeFromArchieve(this.archivedIds).subscribe({
          next:()=>{
            this.onLoad();
            this.getArchivedUsers();
          }
        })
      }
      else{
        this.toastr.error("There is no checked users");
      }
    }

    isFocused: boolean = false;

    toggleFocus(): void {
      this.isFocused = !this.isFocused;
    }

    getDisplayedPages(): number[] {
      const maxDisplayedPages = 5;
      let startPage = Math.max(this.currentPage - Math.floor(maxDisplayedPages / 2), 1);
      let endPage = Math.min(startPage + maxDisplayedPages - 1, this.totalPages);
  
      if (startPage > this.totalPages - maxDisplayedPages + 1) {
          startPage = Math.max(this.totalPages - maxDisplayedPages + 1, 1);
          endPage = this.totalPages;
      }
  
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }

 @HostListener('document:click', ['$event'])
    clickOutside(event: MouseEvent) {
      const clickedInside = (event.target as HTMLElement).closest('.clickable-div');
      if (!clickedInside && this.selectedRolee!='') {
        // Click was outside the .clickable-div and the filter is active
        event.stopPropagation(); // This prevents other click events from executing
      }
    }

  }

