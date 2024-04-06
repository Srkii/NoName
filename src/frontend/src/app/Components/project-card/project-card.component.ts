import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectCardService } from '../../_services/project-card.service';
import {CreateProject} from '../../Entities/CreateProject';
import { Priority, ProjectStatus } from '../../Entities/Project';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {

  users: any[] = [];
  selectedUsers: any[] = [];

  newProject: CreateProject = {
    ProjectName: '',
    Priority: 0,
    ProjectStatus: ProjectStatus.Proposed,
  }

  constructor(
    private route: ActivatedRoute,
    private myProjectCardService: ProjectCardService
  ) {}

  ngOnInit(): void {
    this.myProjectCardService.GetUsers().subscribe(users => {
      this.users = users.map(user => ({ assignees: `${user.firstName} ${user.lastName}`, id: user.id }));
    });
  }

  CreateProject(): void{
    if(this.newProject.StartDate == undefined || this.newProject.EndDate == undefined)
    {
      console.log("You must enter a dates for the project")
      return;
    }

    this.newProject.Priority = +this.newProject.Priority;

    this.myProjectCardService.CreateProject(this.newProject).subscribe(
      response => {
        console.log("Project created successfully", response);

      },
      error => {
        console.error("Error occurred while creating project", error);
      }
    );
  }

}
