import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectCardService } from '../../_services/project-card.service';
import { CreateProject } from '../../Entities/CreateProject';
import { ProjectMember, ProjectRole } from '../../Entities/ProjectMember';
import { SelectedUser } from '../../Entities/SelectedUser';
import { TaskAssignee } from '../../Entities/TaskAssignee';
import { UploadService } from '../../_services/upload.service';

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
  projectNameExists: boolean = false;
  today: Date = new Date();

  projectMembers: ProjectMember[] = [];
  roles: string[] = ["Project Owner","Manager","Participant","Guest"];

  creatorId: number | any

  newProject: CreateProject = {
    ProjectName: '',
    Priority: 0,
  }

  constructor(
    private route: ActivatedRoute,
    private myProjectCardService: ProjectCardService,
    public uploadservice: UploadService
  ) {}

  ngOnInit(): void {
    this.creatorId = localStorage.getItem("id") ? Number(localStorage.getItem("id")) : -1;
    this.myProjectCardService.GetAvailableUsers(this.creatorId).subscribe(users => {
      this.users = users.map<SelectedUser>(user => ({ name: `${user.firstName} ${user.lastName}`, appUserId: user.id, email: user.email, profilePicUrl: user.profilePicUrl,projectRole: ProjectRole.Guest}));
    });
  }

  async CreateProject(): Promise<void>{
    this.projectNameExists = false;
    this.buttonClicked = true;

    if(await this.ProjectNameExists(this.newProject.ProjectName))
    {
      this.projectNameExists = true;
      console.log("Project name already exists")
      return;
    }

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

    if(this.newProject.ProjectName == undefined)
    {
      console.log("You must specify project name")
      return
    }

    this.newProject.AppUserId = this.creatorId;

    this.myProjectCardService.CreateProject(this.newProject).subscribe({
      next: response => {
        console.log("Project created successfully", response);
        var projectMembers = this.selectedUsers.map<ProjectMember>(user => ({ AppUserId: user.appUserId, ProjectId: response.id, ProjectRole: user.projectRole = +user.projectRole}));
        this.AddAssigness(projectMembers);
      },
      error: error => {
        console.error("Error occurred while creating project", error);
      }
    });
  }

  async ProjectNameExists(ProjectName: string)
  {
    try
    {
      var project = await this.myProjectCardService.ProjectNameExists(this.newProject.ProjectName).toPromise();
      return project? true : false;
    }
    catch(error)
    {
      console.error("Error occurred while checking project name", error);
      return;
    }
  }

 AddAssigness(projectMembers: ProjectMember[]){
  
      this.myProjectCardService.AddProjectMembers(projectMembers).subscribe(response => {
        console.log("All users added")
        console.log(response)
      })
    
      this.showComponent = false;
      this.buttonClicked = false;
      this.refreshNeeded.emit();
      this.closeCard.emit();
  }

  SelectedOwner(user: SelectedUser){
    if(this.selectedUsers.find(x => x.projectRole == 1 && x.appUserId != user.appUserId)){
      if(user.projectRole == 1)
        user.projectRole = 4
      return true
    }
    return false
  }

  ToggleProjectCard() {
    this.showComponent = !this.showComponent;
    this.closeCard.emit();
  }

  isInvalidDate(): boolean {
    if(this.newProject.StartDate && this.newProject.EndDate){
      let startDate = new Date(this.newProject.StartDate);
      let currentDate = new Date();
      startDate.setHours(0,0,0,0);
      currentDate.setHours(0,0,0,0);
      return !(this.newProject.StartDate < this.newProject.EndDate && (startDate>=currentDate));
    }
    return false;
  }
}
