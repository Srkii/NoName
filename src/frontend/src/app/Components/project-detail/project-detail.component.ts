import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, TemplateRef} from '@angular/core';
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
import { SharedService } from '../../_services/shared.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { NewTask } from '../../Entities/NewTask';
import { TaskAssignee } from '../../Entities/TaskAssignee';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
  animations: [
    trigger('popFromSide', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(50%)',
        }),
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateX(0)',
        })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({
          opacity: 0,
          transform: 'translateX(50%)',
        })),
      ]),
    ]),
  ],
})
export class ProjectDetailComponent implements OnInit {
  project: Project | any;
  projectTasks: ProjectTask[] = [];
  viewMode: string = 'table';
  modalRef?: BsModalRef;
  groupedTasks: { [key: string]: any } = {};

  update: UpdateProject = {};
  selectedUsers: SelectedUser[] = [];
  usersOnProject: SelectedUser[] = [];
  addableUsers: SelectedUser[] = [];
  filteredUsers: SelectedUser[] = [];
  userId: number = -1;
  searchTerm: string = "";
  userRole: ProjectRole | any;
  clickedTask: ProjectTask | null = null;
  showPopUp: boolean = false;
  task!: ProjectTask;

  // ovo mi treba za add new task
  newTaskName: string = '';
  newTaskDescription: string = '';
  newTaskStartDate: Date | null = null;
  newTaskEndDate: Date | null = null;
  newTaskStatusId: number | null = null;
  newTaskProjectSectionId: number | null = null;
  currentProjectId: number | null = null;
  users: TaskAssignee[] = [];
  selectedUser: TaskAssignee | undefined;;
  filterValue: string | undefined = '';
  @Output() taskAdded = new EventEmitter<boolean>();


  constructor(
    private route: ActivatedRoute,
    private myProjectsService: MyProjectsService,
    private myTasksService: MyTasksService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    public uploadservice: UploadService,
    private shared: SharedService
  ) {}

  get formattedEndDate() {
    return this.datePipe.transform(this.update.endDate, 'yyyy-MM-dd');
  }

  get formattedStartDate() {
    return this.datePipe.transform(this.update.startDate, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    this.currentProjectId = projectId ? +projectId : null;
    this.shared.taskUpdated.subscribe(() => {
      this.getProjectInfo();  // Reload project info
    });
    this.getProjectInfo();
    this.shared.togglePopup$.subscribe(({ event, taskId }) => {
    this.togglePopUp(event, taskId);

  });
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
    });
  }

  loadAddableUsers(){
    this.myProjectsService.GetAddableUsers(this.project.id).subscribe((users: any[]) => {
      this.addableUsers = users.map<SelectedUser>(user => ({ name: `${user.firstName} ${user.lastName}`, appUserId: user.id, email: user.email, profilePicUrl: user.profilePicUrl,projectRole: ProjectRole.Guest}));
      //this.loadPicture(this.addableUsers)
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
        class: "modal modal-lg modal-dialog-centered projectInfoModal",
      }
    );
      this.update.projectId = this.project.id;
      this.update.appUserId = this.userId;
      this.update.projectName = this.project.projectName;
      this.update.description = this.project.description;
      this.update.startDate = this.project.startDate;
      this.update.endDate = this.project.endDate;
      this.update.priority = this.project.priority;
      this.update.projectStatus = this.project.projectStatus;
  }

  openMemberManagment(modal: TemplateRef<void>){
    this.modalRef = this.modalService.show(
      modal,
      {
        class: "modal modal-md modal-dialog-centered MemberManagmentModel",
      }
    );
  }

  updateProject()
  {
    this.spinner.show()
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
            this.getProjectInfo()
            this.spinner.hide()
          })
      }
    }
  }

  addProjectMembers()
  {
    this.spinner.show()
    if(this.userRole == 1 || this.userRole == 0)
    {
      var projectMembers = this.selectedUsers.map<ProjectMember>(user => ({ AppUserId: user.appUserId, ProjectId: this.project.id, ProjectRole: user.projectRole = +user.projectRole}));

      this.myProjectsService.AddProjectMembers(projectMembers).subscribe(response => {
        this.loadAddableUsers()
        this.loadProjectMembers()
        this.selectedUsers = [] 
        this.spinner.hide()
      })
    }
  }

  deleteAssigne(userId: number){
    this.spinner.show()
    if(this.userRole == 0 || this.userRole == 1)
    {
      this.myProjectsService.DeleteProjectMember(this.project.id,userId).subscribe(updatedProject => {
        console.log("Project member deleted successfully")
        this.loadProjectMembers()
        this.loadAddableUsers()
        this.searchTerm = ''
        this.spinner.hide()
      })
    }
  }

  updateUsersRole(user: SelectedUser){
    this.spinner.show();
    if(this.userRole == 0 || this.userRole == 1 || this.userRole == 2)
    {
      var projectMember : ProjectMember = {
        AppUserId: user.appUserId,
        ProjectId: this.project.id,
        ProjectRole: +user.projectRole
      }

      this.myProjectsService.UpdateUsersProjectRole(projectMember).subscribe(update => {
        console.log("User role changed successfully")
        this.spinner.hide()
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

  togglePopUp(event: MouseEvent, taskId: number): void {
    event.stopPropagation(); 
    this.myTasksService
      .GetProjectTask(taskId,this.userId)
      .subscribe((task: ProjectTask) => {
        if (
          this.clickedTask &&
          this.clickedTask.id === taskId &&
          this.showPopUp
        ) {
          this.showPopUp = false;
          this.clickedTask = null;
          this.shared.current_task_id = null;
        } else {
          this.clickedTask = task;
          this.showPopUp = true;
          this.shared.current_task_id = this.clickedTask.id;
        }
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const popUp = document.querySelector('.pop') as HTMLElement;
    if (popUp && !popUp.contains(event.target as Node) && this.showPopUp) {
      this.showPopUp = false;
      this.clickedTask = null;
    }
  }

  closePopup() {
    this.clickedTask = null; 
    this.showPopUp = false; 
  }

  getPriorityClass() {
    switch (this.update.priority) {
        case Priority.Low:
            return "LOW"
        case Priority.Medium:
            return "MEDIUM"
        case Priority.High:
            return "HIGH"
        default:
            return "DEFAULT"
    }
  }

  getStatusClass(){
    switch (this.update.projectStatus) {
      case ProjectStatus.Archived:
          return "ARCHIVED"
      case ProjectStatus.InProgress:
          return "INPROGRESS"
      case ProjectStatus.Proposed:
          return "PROPOSED"
      case ProjectStatus.Completed:
          return "COMPLETED"
      default:
          return "DEFAULT"
    }
  }

  enableNameChange(){
    let changeNameInp = document.getElementById("projectName") as HTMLInputElement
    changeNameInp.disabled = false;
    changeNameInp.focus();
  }

  disableNameChange(){
    let changeNameInp = document.getElementById("projectName") as HTMLInputElement
    changeNameInp.disabled = true;
  }

  saveTask() {
    const task: NewTask = {
      TaskName: this.newTaskName,
      Description: this.newTaskDescription,
      StartDate: this.newTaskStartDate || new Date(),
      EndDate: this.newTaskEndDate || new Date(),
      ProjectId: this.currentProjectId || 0,
      AppUserId: this.selectedUser?.appUserId || 0
    };
    this.myTasksService.createTask(task).subscribe({
      next: () => {
        this.modalRef?.hide();
        this.getProjectInfo();
        this.shared.taskAdded(true);
        
        // Resetj polja
        this.newTaskName = '';
        this.newTaskDescription = '';
        this.newTaskStartDate = null;
        this.newTaskEndDate = null;
        this.newTaskStatusId = null;
        this.newTaskProjectSectionId = null;
        this.selectedUser = undefined;
      },
      error: (error) => console.error('Error creating task:', error)
    });
  }
  // vraca AppUsers koji su na projektu
  getProjectsUsers(currentProjectId: number) {
    this.myProjectsService.getUsersByProjectId(currentProjectId).subscribe({
      next: response => {
        this.users = response,
        this.users.forEach(user => {
          user.fullName = user.firstName + ' ' + user.lastName;
        });
      },
      error: error => console.log(error)
    });
  }

  openNewTaskModal(modal: TemplateRef<void>) {
    if (this.currentProjectId !== null)
      this.getProjectsUsers(this.currentProjectId);
    this.modalRef = this.modalService.show(
      modal,
      {
        class: 'modal-lg modal-dialog-centered'
      });
  }

}
