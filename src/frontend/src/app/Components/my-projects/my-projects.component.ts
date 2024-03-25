import { Component, OnInit } from '@angular/core';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Project, ProjectStatus, Priority } from '../../Entities/Project';
import { NgxSpinnerService } from "ngx-spinner";
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
    this.myProjectsService.getProjects().subscribe((projects: Project[]) => {
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

  // Method to handle changes in status and priority
  handleStatusChange(event: any) {
    this.selectedStatus = event.target.value;
  }

  handlePriorityChange(event: any) {
    this.selectedPriority = event.target.value;
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
    return statusMatch && priorityMatch && nameMatch;
  }

  goToProject(id: number) {
    this.router.navigate(['/project', id]);
  }
}
