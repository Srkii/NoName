import { Component, OnInit } from '@angular/core';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Project, ProjectStatus, Priority } from '../../Entities/Project';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { identifierName } from '@angular/compiler';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css'],
})
export class MyProjectsComponent implements OnInit {
  all_projects:number=0;
  projects: Project[] = [];
  filteredProjects: Project[] | undefined;
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  originalProjects: Project[] = [];
  totalPagesArray: number[] = [];


  constructor(
    
    private myProjectsService: MyProjectsService,
   
    private spinner: NgxSpinnerService,
    private router: Router
  
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    const id = localStorage.getItem('id');
    this.myProjectsService.GetUsersProjectsCount(id).subscribe((count:number)=>{
      this.all_projects=count;
    });
    this.myProjectsService.getUsersProjectsByPage(id, this.currentPage, this.pageSize)
  .subscribe((projects: Project[]) => {
    this.projects = projects;
    this.originalProjects = [...this.projects];
    this.totalPages = Math.ceil(this.all_projects / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
    this.spinner.hide();
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

  selectedStatus: string = '';
  selectedPriority: string = '';
  ProjectName: string = '';
  StartDateFilter: string = '';
  EndDateFilter: string = '';

  handleStatusChange(event: any) {
    this.selectedStatus = event.target.value;
  }

  handlePriorityChange(event: any) {
    this.selectedPriority = event.target.value;
  }

  handleStartDateChange(event: any) {
    this.StartDateFilter = event.target.value;
  }

  handleEndDateChange(event: any) {
    this.EndDateFilter = event.target.value;
  }

  goToProject(id: number) {
    this.router.navigate(['/project', id]);
  }

  fillterProjects(): void {
    // Convert the input value to lowercase for case-insensitive search
    const projectName = this.ProjectName.trim();
    const projectStatus = this.selectedStatus;
    const projectPriority = this.selectedPriority;
    const projectStartDate = this.StartDateFilter;
    const projectEndDate = this.EndDateFilter;
    if (projectStartDate === '' && projectEndDate === '' && projectPriority === '' && projectStatus === '' && projectName === '') {
      // If all search queries are empty, reload all projects
      this.reloadProjects();
      return;
    }

  
    this.spinner.show();
    const id = localStorage.getItem('id');
    this.currentPage=1;
    this.myProjectsService.filterProjects(projectName, projectStatus, projectPriority, projectEndDate, projectStartDate, this.currentPage, this.pageSize).subscribe((filteredProjects: Project[]) => {
      this.projects = filteredProjects;
      // this.totalPages = Math.ceil(filteredProjects.length / this.pageSize);
      // this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
      this.spinner.hide();
    });
  }
  fillterProjects1(): void {
    // Convert the input value to lowercase for case-insensitive search
    const projectName = this.ProjectName.trim();
    const projectStatus = this.selectedStatus;
    const projectPriority = this.selectedPriority;
    const projectStartDate = this.StartDateFilter;
    const projectEndDate = this.EndDateFilter;
    if (projectStartDate === '' && projectEndDate === '' && projectPriority === '' && projectStatus === '' && projectName === '') {
      // If all search queries are empty, reload all projects
      this.reloadProjects();
      return;
    }

  
    this.spinner.show();
    const id = localStorage.getItem('id');
    this.myProjectsService.filterProjects(projectName, projectStatus, projectPriority, projectEndDate, projectStartDate, this.currentPage, this.pageSize).subscribe((filteredProjects: Project[]) => {
      this.projects = filteredProjects;
      // this.totalPages = Math.ceil(this.all_projects / this.pageSize);
      // this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
      this.spinner.hide();
    });
  }

  reloadProjects(): void {
    this.spinner.show();
    const id = localStorage.getItem('id');
    this.myProjectsService.GetUsersProjectsCount(id).subscribe((count:number)=>{
      this.all_projects=count;
    });
    this.myProjectsService.getUsersProjectsByPage(id, this.currentPage, this.pageSize)
  .subscribe((projects: Project[]) => {
    this.projects = projects;
    this.originalProjects = [...this.projects];
    this.totalPages = Math.ceil(this.all_projects / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
    this.spinner.hide();
});
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.fillterProjects1();
    }
  }
  nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.fillterProjects1();
  }
}

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fillterProjects1();
    }
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    if(target.value!="")
    {
      const pageSize = Number(target.value);
      this.pageSize = pageSize;
    }
    this.reloadProjects();
  }
  

}
