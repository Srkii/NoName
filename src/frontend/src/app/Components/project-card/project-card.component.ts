import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectCardService } from '../../_services/project-card.service';
import {CreateProject} from '../../Entities/CreateProject';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {

  users: any[] = [];
  selectedUsers: any[] = [];
  @Output() closeCard = new EventEmitter<void>();
  showComponent: boolean = true;
  buttonClicked: boolean = false;

  newProject: CreateProject = {
    ProjectName: '',
    Priority: 0,
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
    this.buttonClicked = true;

    if(this.newProject.StartDate == undefined || this.newProject.EndDate == undefined)
    {
      console.log("You must enter a dates for the project")
      return;
    }

    if(this.newProject.ProjectName == "")
    {
      console.log("You must specify project name")
      return
    }

    this.newProject.Priority = +this.newProject.Priority;

    this.myProjectCardService.CreateProject(this.newProject).subscribe(
      response => {
        console.log("Project created successfully", response);
        this.showComponent = false;
        this.buttonClicked = false;
        this.closeCard.emit();
      },
      error => {
        console.error("Error occurred while creating project", error);
      }
    );
  }

  ToggleProjectCard() {
    this.showComponent = !this.showComponent;
    this.closeCard.emit();
  }

  isInvalidDate(): boolean {
    if(this.newProject.StartDate && this.newProject.EndDate)
      return this.buttonClicked && (this.buttonClicked && !(this.newProject.StartDate < this.newProject.EndDate));
    return false;
  }
  
}
