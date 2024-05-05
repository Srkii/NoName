import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Project, ProjectStatus, Priority } from '../../Entities/Project';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { Member, UserRole } from '../../Entities/Member';
import { UploadService } from '../../_services/upload.service';


@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {
  all_projects:number=0;
  projects: Project[] = [];
  filteredProjects: number=0;
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  originalProjects: Project[] = [];
  totalPagesArray: number[] = [];
  rangeDates: Date[] | undefined;
  

  selectedStatus: string = '';
  userRole: UserRole | any;
  projectOwners: { [projectId: number]: Member | null } = {};
  searchText: string='';
  
  
  
  showProjectCard: boolean = false;
  constructor(

    private myProjectsService: MyProjectsService,

    private spinner: NgxSpinnerService,
    public uploadservice: UploadService,
    private router: Router,
    

  ) {}

  ngOnInit(): void {
    this.spinner.show();

    const userId = localStorage.getItem('id')
    this.userRole = localStorage.getItem('role');
    let startDate = '';
    let endDate = '';
    if (this.rangeDates && this.rangeDates.length === 2) {
      const start = new Date(this.rangeDates[0]);
      const end = new Date(this.rangeDates[1]);
      if(this.rangeDates[0])
        startDate = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;
      if(this.rangeDates[1])
        endDate = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`;
    
    }

    this.myProjectsService.GetUsersProjectsCount(userId).subscribe((count: number) => {
      this.all_projects = count;
    });
    this.myProjectsService.filterAndPaginateProjects(
      this.searchText,
      this.selectedStatus,
      startDate,
      endDate,
      userId,
      this.currentPage,
      this.pageSize
    ).subscribe((projects: Project[]) => {
      this.projects = projects;
      this.filteredProjects=this.all_projects;
      this.totalPages = Math.ceil(this.all_projects / this.pageSize);
      this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
      this.loadProjectOwners();
      this.spinner.hide();
    });
  }

  loadProjects(userId: any): void {
    this.spinner.show();
    // this.myProjectsService.GetUsersProjectsCount(userId).subscribe((count: number) => {
    //   this.all_projects = count;
    // });
    let startDate = '';
    let endDate = '';
    if (this.rangeDates && this.rangeDates.length === 2) {
      const start = new Date(this.rangeDates[0]);
      const end = new Date(this.rangeDates[1]);
      if(this.rangeDates[0])
        startDate = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;
      if(this.rangeDates[1])
        endDate = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`;
    
  }
    this.myProjectsService.filterAndPaginateProjects(
      this.searchText,
      this.selectedStatus,
      startDate,
      endDate,
      userId,
      this.currentPage,
      this.pageSize
    ).subscribe((projects: Project[]) => {
      this.projects = projects;
      this.loadProjectOwners();
      this.spinner.hide();
    });
    this.myProjectsService.CountFilteredProjects( this.searchText,
      this.selectedStatus,
      startDate,
      endDate,
      userId,
      this.currentPage,
      this.pageSize
    ).subscribe((filteredProjects: number) => {
      this.filteredProjects=filteredProjects;
      this.totalPages = Math.ceil(this.filteredProjects / this.pageSize);
      this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
      this.spinner.hide();
    });
  }

  loadProjectOwners(){
    this.projects.forEach(project => {
      this.myProjectsService.GetProjectOwner(project.id).subscribe((owner: Member) => {
        this.projectOwners[project.id] = owner
      })
   });
  }

  getStatusString(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Proposed:
        return 'PROPOSED';
      case ProjectStatus.InProgress:
        return 'IN PROGRESS';
      case ProjectStatus.Completed:
        return 'COMPLETED';
      case ProjectStatus.Archived:
        return 'ARCHIVED';
      default:
        return '';
    }
  }

  getPriorityString(priority: Priority): string {
    switch (priority) {
      case Priority.Low:
        return 'LOW';
      case Priority.Medium:
        return 'MEDIUM';
      case Priority.High:
        return 'HIGH';
      default:
        return '';
    }
  }



  handleStatusChange(event: any) {
    this.selectedStatus = event.target.value;
  }




  goToProject(id: number) {
    this.router.navigate(['/project', id]);
  }

  filterProjects(): void {
    this.spinner.show();
     this.currentPage = 1;
    const id = localStorage.getItem('id');
    this.loadProjects(id);
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.filterProjects();
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      const id = localStorage.getItem('id');
    this.loadProjects(id);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      const id = localStorage.getItem('id');
    this.loadProjects(id);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      const id = localStorage.getItem('id');
    this.loadProjects(id);
    }
  }

  changePageSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.value !== '') {
      const pageSize = Number(target.value);
      this.pageSize = pageSize;
      const id = localStorage.getItem('id');
    this.loadProjects(id);
    }
  }

  ToggleProjectCard() {
    this.showProjectCard = !this.showProjectCard;
  }

  handleCloseCard(){
    this.showProjectCard = false;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
      if (!(event.target as HTMLElement).closest('.proj_card') && !(event.target as HTMLElement).closest('.btn.btn-primary.btn-sm')) {
        this.handleCloseCard();
      }
  }

  handleDateRangeChange(selectedDates: Date[] | undefined) {
    if (selectedDates && selectedDates.length === 2) {
      const startDate = selectedDates[0];
      const endDate = selectedDates[1];
      console.log('Start Date:', startDate);
      console.log('Start Date:', this.rangeDates);
      console.log('End Date:', endDate);
  }
}
  
  
}
