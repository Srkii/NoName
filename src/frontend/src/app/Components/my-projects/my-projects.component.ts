import { Component, OnInit } from '@angular/core';
import { MyProjectsService } from '../../Services/my-projects.service';
import { Project, ProjectStatus, Priority } from '../../Entities/Project';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css'],
})
export class MyProjectsComponent implements OnInit {
  projects: Project[] = [];

  constructor(private myProjectsService: MyProjectsService) {}

  ngOnInit(): void {
    this.myProjectsService.getProjects().subscribe((projects: Project[]) => {
      this.projects = projects;
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
}
