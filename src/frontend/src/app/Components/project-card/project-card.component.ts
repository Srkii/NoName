import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectCardService } from '../../_services/project-card.service';
import {CreateProject} from '../../Entities/CreateProject';
import { ProjectMember, ProjectRole } from '../../Entities/ProjectMember';
import { SelectedUser } from '../../Entities/SelectedUser';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {

  users: SelectedUser[] = [];
  selectedUsers: SelectedUser[] = [];
  @Output() closeCard = new EventEmitter<void>();
  @Output() refreshNeeded = new EventEmitter<void>();
  showComponent: boolean = true;
  buttonClicked: boolean = false;
  projectMembers: ProjectMember[] = [];
  selectedRoles: ProjectRole[] = [];
  roles: string[] = ["Project Owner","Manager","Participant","Guest"];

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
      this.users = users.map<SelectedUser>(user => ({ name: `${user.firstName} ${user.lastName}`, id: user.id, email: user.email, profilePicUrl: user.profilePicUrl,projectRole: 4}));
    });
  }

  CreateProject(): void{
    this.buttonClicked = true;

    if(this.newProject.StartDate == undefined || this.newProject.EndDate == undefined)
    {
      console.log("You must enter a dates for the project")
      return;
    }

    if(this.isInvalidDate())
    {
      console.log("Unvalid dates");
      return;
    }

    if(this.newProject.ProjectName == "")
    {
      console.log("You must specify project name")
      return
    }

    this.newProject.Priority = +this.newProject.Priority;

    this.myProjectCardService.CreateProject(this.newProject).subscribe({
      next: response => {
        console.log("Project created successfully", response);
        console.log(this.selectedUsers);
        var projectMembers = this.selectedUsers.map<ProjectMember>(user => ({ AppUserId: user.id, ProjectId: response.id, ProjectRole: user.projectRole = +user.projectRole}));
        this.AddAssigness(projectMembers);
      },
      error: error => {
        console.error("Error occurred while creating project", error);
      }
    });
  }

  async AddAssigness(projectMembers: ProjectMember[]){
    try 
    {
      for (let member of projectMembers)
      {
          await this.myProjectCardService.AddProjectMember(member).toPromise();
          console.log("Project member added successfully");
      }
      this.showComponent = false;
      this.buttonClicked = false;
      this.refreshNeeded.emit();
      this.closeCard.emit();
    } 
    catch (error) 
    {
      console.error("Error occurred while adding project member", error);
    }
  }

  ToggleProjectCard() {
    this.showComponent = !this.showComponent;
    this.closeCard.emit();
  }

  isInvalidDate(): boolean {
    if(this.newProject.StartDate && this.newProject.EndDate)
      return this.buttonClicked && !(this.newProject.StartDate < this.newProject.EndDate);
    return false;
  }
  
}
