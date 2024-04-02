import { Component, OnInit } from '@angular/core';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Project, ProjectStatus, Priority } from '../../Entities/Project';
import { NgxSpinnerService } from 'ngx-spinner';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css'],
})
export class MyProjectsComponent implements OnInit {
  projects: Project[] = [];

  constructor(
    
    private myProjectsService: MyProjectsService,
   
    private spinner: NgxSpinnerService,
    private router: Router
  
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    const id = localStorage.getItem('id');
    this.myProjectsService.getUsersProjects(id).subscribe((projects: Project[]) => {
      this.projects = projects;
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
  sortProjects(option: string) {
    switch (option) {
      case 'From lowest to highest':
        this.projects.sort((a, b) => {
          const startDateA = new Date(a.startDate).getTime();
          const startDateB = new Date(b.startDate).getTime();
          return startDateA - startDateB;
        });
        break;

      case 'From highest to lowest':
        this.projects.sort((a, b) => {
          const startDateA = new Date(a.startDate).getTime();
          const startDateB = new Date(b.startDate).getTime();
          return startDateB - startDateA;
        });
        break;

      // Add other sorting options as needed

      default:
        this.myProjectsService
          .getProjects()
          .subscribe((projects: Project[]) => {
            this.projects = projects;
          });
        break;
    }
  }
  sortProjects1(option: string) {
    switch (option) {
      case 'From lowest to highest1':
        this.projects.sort((a, b) => {
          const endDateA = new Date(a.endDate).getTime();
          const endDateB = new Date(b.endDate).getTime();
          return endDateA - endDateB;
        });
        break;

      case 'From highest to lowest1':
        this.projects.sort((a, b) => {
          const endDateA = new Date(a.endDate).getTime();
          const endDateB = new Date(b.endDate).getTime();
          return endDateB - endDateA;
        });
        break;

      // Add other sorting options as needed

      default:
        this.myProjectsService
          .getProjects()
          .subscribe((projects: Project[]) => {
            this.projects = projects;
          });
        break;
    }
  }

  isProjectVisible(project: Project): boolean {
    const statusMatch =
      this.selectedStatus === '' ||
      this.getStatusString(project.projectStatus) === this.selectedStatus;
    const priorityMatch =
      this.selectedPriority === '' ||
      this.getPriorityString(project.priority) === this.selectedPriority;
    const nameMatch = project.projectName
      .toLowerCase()
      .includes(this.ProjectName.toLowerCase());

    // Check if default option is selected for start and end dates
    const startDateDefaultSelected = this.StartDateFilter === '';
    const endDateDefaultSelected = this.EndDateFilter === '';

    // If default option is selected, return true for start and end date conditions
    if (startDateDefaultSelected && endDateDefaultSelected) {
      return statusMatch && priorityMatch && nameMatch;
    }

    let startDateMatch = false;
    let endDateMatch = false;

    // Compare start date filter with project start date
    if (!startDateDefaultSelected) {
      startDateMatch = this.compareStartDate(
        project.startDate,
        new Date(this.StartDateFilter)
      );
    } else {
      startDateMatch = true; // No filter applied, so it's always a match
    }

    // Compare end date filter with project end date
    if (!endDateDefaultSelected) {
      endDateMatch = this.compareEndDate(
        project.endDate,
        new Date(this.EndDateFilter)
      );
    } else {
      endDateMatch = true; // No filter applied, so it's always a match
    }

    return (
      statusMatch &&
      priorityMatch &&
      nameMatch &&
      startDateMatch &&
      endDateMatch
    );
  }

  compareStartDate(startDate: any, filterDate: Date): boolean {
    // Check if startDate is a string
    if (typeof startDate === 'string') {
      // Parse the string into a Date object
      startDate = new Date(startDate);
    }

    // Check if startDate is a valid Date object
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      return false;
    }

    const currentDate = new Date();
    const start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const end = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const diffTime = Math.abs(start.getTime() - end.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (this.StartDateFilter) {
      case 'Today':
        return diffDays === 0;
      case 'Yesterday':
        return diffDays === 1;
      case 'Last 7 days':
        return diffDays <= 7;
      case 'Last 30 days':
        return diffDays <= 30;
      case 'This month':
        return (
          currentDate.getMonth() === startDate.getMonth() &&
          currentDate.getFullYear() === startDate.getFullYear()
        );
      case 'Last month':
        return this.isLastMonth(startDate);
      case 'This Year':
        return currentDate.getFullYear() === startDate.getFullYear();
      // case 'From lowest to highest':
      //   this.projects.sort((a, b) => {
      //     const endDateA = new Date(a.startDate).getTime();
      //     const endDateB = new Date(b.startDate).getTime();
      //     return endDateB - endDateA;
      //   });
      //   return true;

      // case 'From highest to lowest':
      //   this.projects.sort((a, b) => {
      //     const endDateA = new Date(a.startDate).getTime();
      //     const endDateB = new Date(b.startDate).getTime();
      //     return endDateA - endDateB;
      //   });
      //   return true;
      // Add logic for other options as needed
      default:
        return true; // Default to true if no filter selected
    }
  }

  compareEndDate(endDate: any, filterDate: Date): boolean {
    // Check if endDate is a string
    if (typeof endDate === 'string') {
      // Parse the string into a Date object
      endDate = new Date(endDate);
    }

    // Check if endDate is a valid Date object
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      return false;
    }

    const currentDate = new Date();
    const start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const end = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );
    const diffTime = Math.abs(start.getTime() - end.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (this.EndDateFilter) {
      case 'Today1':
        return diffDays === 0;
      case 'Yesterday1':
        return diffDays === 1;
      case 'Last 7 days1':
        return diffDays <= 7;
      case 'Last 30 days1':
        return diffDays <= 30;
      case 'This month1':
        return (
          currentDate.getMonth() === endDate.getMonth() &&
          currentDate.getFullYear() === endDate.getFullYear()
        );
      case 'Last month1':
        return this.isLastMonth(endDate);
      case 'This Year1':
        return currentDate.getFullYear() === endDate.getFullYear();
      // Other cases...
      case 'From lowest to highest1':
        this.projects.sort((a, b) => {
          const endDateA = new Date(a.endDate).getTime();
          const endDateB = new Date(b.endDate).getTime();
          return endDateB - endDateA;
        });
        return true;

      case 'From highest to lowest1':
        this.projects.sort((a, b) => {
          const endDateA = new Date(a.endDate).getTime();
          const endDateB = new Date(b.endDate).getTime();
          return endDateA - endDateB;
        });
        return true;

      // Default case...

      // Add logic for other options as needed
      default:
        return true; // Default to true if no filter selected
    }
  }

  isLastMonth(date: Date): boolean {
    const currentDate = new Date();
    const lastMonth =
      currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
    const lastYear =
      lastMonth === 11
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear();

    return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
  }

  goToProject(id: number) {
    this.router.navigate(['/project', id]);
  }
}
