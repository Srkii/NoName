import { Component, HostListener, OnInit } from '@angular/core';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Project, ProjectStatus, Priority } from '../../Entities/Project';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { Member, UserRole } from '../../Entities/Member';
import { UploadService } from '../../_services/upload.service';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css'],
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

  selectedStatus: string = '';
  selectedPriority: string = '';
  projectName: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';
  userRole: UserRole | any;
  projectOwners: { [projectId: number]: Member | null } = {};
  
  showProjectCard: boolean = false;
  constructor(

    private myProjectsService: MyProjectsService,

    private spinner: NgxSpinnerService,
    public uploadservice: UploadService,
    private router: Router

  ) {}

  ngOnInit(): void {
    this.spinner.show();
    const userId = localStorage.getItem('id')
    this.userRole = localStorage.getItem('role')
    this.myProjectsService.GetUsersProjectsCount(userId).subscribe((count: number) => {
      this.all_projects = count;
    });
    this.myProjectsService.filterAndPaginateProjects(
      this.projectName,
      this.selectedStatus,
      this.selectedPriority,
      this.endDateFilter,
      this.startDateFilter,
      userId,
      this.currentPage,
      this.pageSize
    ).subscribe((projects: Project[]) => {
      this.projects = projects;
      this.filteredProjects=this.all_projects;
      this.totalPages = Math.ceil(this.all_projects / this.pageSize);
      this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
      this.loadProjectOwners()
      console.log(this.projectOwners)
      this.spinner.hide();
    });
  }

  loadProjects(userId: any): void {
    this.spinner.show();
    // this.myProjectsService.GetUsersProjectsCount(userId).subscribe((count: number) => {
    //   this.all_projects = count;
    // });
    this.myProjectsService.filterAndPaginateProjects(
      this.projectName,
      this.selectedStatus,
      this.selectedPriority,
      this.endDateFilter,
      this.startDateFilter,
      userId,
      this.currentPage,
      this.pageSize
    ).subscribe((projects: Project[]) => {
      this.projects = projects;
      this.spinner.hide();
    });
    this.myProjectsService.CountFilteredProjects( this.projectName,
      this.selectedStatus,
      this.selectedPriority,
      this.endDateFilter,
      this.startDateFilter,
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

  handlePriorityChange(event: any) {
    this.selectedPriority = event.target.value;
  }

  handleStartDateChange(event: any) {
    this.startDateFilter = event.target.value;
  }

  handleEndDateChange(event: any) {
    this.endDateFilter = event.target.value;
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
    this.projectName = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
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
}
