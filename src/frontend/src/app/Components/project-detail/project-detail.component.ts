import { Component, ElementRef, EventEmitter, OnInit, Output, TemplateRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Priority, Project, ProjectStatus } from '../../Entities/Project';
import { MyTasksService } from '../../_services/my-tasks.service';
import { ProjectTask} from '../../Entities/ProjectTask';
import { NgxSpinnerService } from "ngx-spinner";
import { SelectedUser } from '../../Entities/SelectedUser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UpdateProject } from '../../Entities/UpdateProject';
import { DatePipe } from '@angular/common';
import { ProjectMember, ProjectRole } from '../../Entities/ProjectMember';
import { Member } from '../../Entities/Member';
import { UploadService } from '../../_services/upload.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | any;
  projectTasks: ProjectTask[] = [];
  viewMode: string = 'table';
  modalRef?: BsModalRef;
  groupedTasks: { [key: string]: any } = {};

  update: UpdateProject = {};
  selectedUser: SelectedUser | undefined;
  usersOnProject: SelectedUser[] = [];
  addableUsers: SelectedUser[] = [];
  filteredUsers: SelectedUser[] = [];
  userId: number = -1;
  searchTerm: string = "";
  userRole: ProjectRole | any;

  constructor(
    private route: ActivatedRoute,
    private myProjectsService: MyProjectsService,
    private myTasksService: MyTasksService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private uploadservice: UploadService
  ) {}

  get formattedEndDate() {
    return this.datePipe.transform(this.update.endDate, 'yyyy-MM-dd');
  }

  get formattedStartDate() {
    return this.datePipe.transform(this.update.startDate, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.getProjectInfo();
  }

  getProjectInfo() {
    this.spinner.show();
    this.userId = localStorage.getItem("id") ? Number(localStorage.getItem("id")) : -1
  
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.myProjectsService.getProjectById(+projectId).subscribe((project) => {
        this.project = project;
        this.myTasksService.GetTasksByProjectId(project.id).subscribe((tasks) => {
          this.projectTasks = tasks;
          this.groupedTasks = this.groupTasksBySection(tasks);
        });
        this.loadProjectMembers();
        this.loadAddableUsers();
        this.spinner.hide();
      });
    }
  }

  loadProjectMembers(){
    this.myProjectsService.getUsersByProjectId(this.project.id).subscribe((users: any[]) => {
      this.usersOnProject = users.map<SelectedUser>(user => ({ name: `${user.firstName} ${user.lastName}`, appUserId: user.appUserId, email: user.email, profilePicUrl: user.profilePicUrl,projectRole: +user.projectRole}));
      this.filteredUsers = this.usersOnProject;
      this.userRole = this.usersOnProject.find(x => x.appUserId == this.userId)?.projectRole;
      this.loadPicture(this.usersOnProject)
    });
  }

  loadAddableUsers(){
    this.myProjectsService.GetAddableUsers(this.project.id).subscribe((users: any[]) => {
      this.addableUsers = users.map<SelectedUser>(user => ({ name: `${user.firstName} ${user.lastName}`, appUserId: user.id, email: user.email, profilePicUrl: user.profilePicUrl,projectRole: ProjectRole.Guest}));
      this.loadPicture(this.addableUsers)
    });
  }

  groupTasksBySection(tasks: any[]): { [key: string]: any } {
    const grouped = tasks.reduce((acc, task) => {
      const section = task.sectionName || 'No Section';
      if (!acc[section]) {
        acc[section] = { tasks: [], visible: section === 'No Section' };
      }
      acc[section].tasks.push(task);
      return acc;
    }, {});
    if (!grouped['No Section']) {
      grouped['No Section'] = { tasks: [], visible: true };
    }

    return grouped;
  }

  toggleSectionVisibility(section: string): void {
    this.groupedTasks[section].visible = !this.groupedTasks[section].visible;
  }

  sectionOrder = (a: { key: string }, b: { key: string }) => {
    if (a.key === 'No Section') return -1;
    if (b.key === 'No Section') return 1;
    return a.key.localeCompare(b.key);
  };

  changeToTable() {
    this.getProjectInfo();
    this.viewMode = 'table';
  }
  changeToKanban() {
    this.getProjectInfo();
    this.viewMode = 'kanban';
  }
  changeToGant() {
    this.getProjectInfo();
    this.viewMode = 'gantt';
  }

  openProjectInfo(modal: TemplateRef<void>){
    this.modalRef = this.modalService.show(
      modal,
      {
        class: "modal modal-lg modal-dialog-centered"
      });
      this.update.projectId = this.project.id;
      this.update.appUserId = this.userId;
      this.update.projectName = this.project.projectName;
      this.update.description = this.project.description;
      this.update.startDate = this.project.startDate;
      this.update.endDate = this.project.endDate;
      this.update.priority = this.project.priority;
      this.update.projectStatus = this.project.projectStatus;
  }

  updateProject()
  {
    if(this.userRole == 1 || this.userRole == 2 || this.userRole == 0)
    {
      if(this.update.projectName !== this.project.projectName || this.update.projectStatus!=this.project.projectStatus ||
        this.update.endDate != this.project.endDate || this.update.description != this.project.description || this.update.priority != this.project.priority
      )
      {
        if(this.update.priority!==undefined && this.update.projectStatus!==undefined)
          {
            this.update.priority = +this.update.priority;
            this.update.projectStatus = +this.update.projectStatus;
          }
      
          this.myProjectsService.UpdateProject(this.update).subscribe(updatedProject => {
            console.log(updatedProject)
            this.getProjectInfo()
          })
      }
    }
  }

  addProjectMember()
  {
    if(this.userRole == 1 || this.userRole == 0)
    {
      if(this.selectedUser !== undefined ){
        var projectMember : ProjectMember = {
          AppUserId: this.selectedUser.appUserId,
          ProjectId: this.project.id,
          ProjectRole: +this.selectedUser.projectRole
        }
        
        this.myProjectsService.AddProjectMember(projectMember).subscribe(response => {
          this.loadAddableUsers()
          this.loadProjectMembers()
          this.selectedUser = undefined
        })
      }
    }
  }

  deleteAssigne(userId: number){
    if(this.userRole == 0 || this.userRole == 1)
    {
      this.myProjectsService.DeleteProjectMember(this.project.id,userId).subscribe(updatedProject => {
        console.log("Project member deleted successfully")
        this.loadProjectMembers()
        this.loadAddableUsers()
        this.searchTerm = ''
      })
    }
  }

  updateUsersRole(user: SelectedUser){
    if(this.userRole == 0 || this.userRole == 1 || this.userRole == 2)
    {
      var projectMember : ProjectMember = {
        AppUserId: user.appUserId,
        ProjectId: this.project.id,
        ProjectRole: +user.projectRole
      }
  
      this.myProjectsService.UpdateUsersProjectRole(projectMember).subscribe(update => {
        console.log("User role changed successfully")
      })
    }
  }

  filterUsers() {
    if (this.searchTerm.trim() !== '') 
    {
      this.filteredUsers = this.usersOnProject.filter(user => 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    else {
      this.filteredUsers = this.usersOnProject;
    }
  }

  loadPicture(usersArray: SelectedUser[]) : void{
    usersArray.forEach(user => {
      if(user.profilePicUrl!='' && user.profilePicUrl!=null){ 
      this.uploadservice.getImage(user.profilePicUrl).subscribe(
        url => {
          user.profilePic = url;
        }
        )
      }
    });
  }

}
