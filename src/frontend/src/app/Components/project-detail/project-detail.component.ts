import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, TemplateRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Project, ProjectStatus } from '../../Entities/Project';
import { MyTasksService } from '../../_services/my-tasks.service';
import { ProjectTask} from '../../Entities/ProjectTask';
import { NgxSpinnerService } from "ngx-spinner";
import { SelectedUser } from '../../Entities/SelectedUser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UpdateProject } from '../../Entities/UpdateProject';
import { ProjectMember, ProjectRole } from '../../Entities/ProjectMember';
import { UploadService } from '../../_services/upload.service';
import { SharedService } from '../../_services/shared.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { NewTask } from '../../Entities/NewTask';
import { TaskAssignee } from '../../Entities/TaskAssignee';
import { ProjectSection } from '../../Entities/ProjectSection';
import { ProjectSectionService } from '../../_services/project-section.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { QuillConfigService } from '../../_services/quill-config.service';

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
  selectedUser: TaskAssignee | undefined;
  selectedSection: ProjectSection | undefined;
  filterValue: string | undefined = '';
  @Output() taskAdded = new EventEmitter<boolean>();

  buttonClicked: boolean = false;
  taskNameExists: boolean = false;
  enabledEditorOptions: boolean = false;
  allTasks: any[] = [];

  // za view archived tasks
  archivedTasks: ProjectTask[] = [];

  // za section modal
  projectSections: ProjectSection[] = [];
  filteredSections: ProjectSection[] = [];
  newSectionName: string = '';
  searchSection: string = '';

  today: Date = new Date();
  userRole: ProjectRole | any;


  rangeDates: Date[] | undefined;
  selectedStatus: string = '';
  searchText: string='';

  sortOrderName: 'asc' | 'desc' = 'asc';
  sortOrderAssignee: 'asc' | 'desc' = 'asc';
  sortOrderStartDate: 'asc' | 'desc' = 'asc';
  sortOrderEndDate: 'asc' | 'desc' = 'asc';
  sortOrderStatus: 'asc' | 'desc' = 'asc';
  sortField: keyof ProjectTask = 'taskName';

  allStatuses:any[]=[];
  

  constructor(
    private route: ActivatedRoute,
    private myProjectsService: MyProjectsService,
    private myTasksService: MyTasksService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    public uploadservice: UploadService,
    private shared: SharedService,
    private projectSectionService: ProjectSectionService,
    private router: Router,
    private toastr: ToastrService,
    public quillService: QuillConfigService,
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if(projectId)
      this.myTasksService.GetTaskStatuses(parseInt(projectId)).subscribe((statuses: any[]) => {
        this.allStatuses = statuses;
        this.allStatuses = this.allStatuses.filter(status => status.name !== 'Archived');
      });
    const userId = localStorage.getItem("id");
    this.currentProjectId = projectId ? +projectId : null;

    if (projectId && userId) {
      this.getUsersProjectRole(+projectId, +userId);
    }
    this.shared.taskUpdated.subscribe(() => {
      this.getProjectInfo();  // Reload project info
    });
    this.shared.sectionUpdated.subscribe(() => {
      this.getProjectInfo();
    })
    // nzm koliko je ovo pametno
    this.route.params.subscribe(params => {
      const projectId = +params['id']; // '+' converts the parameter string to a number
      this.currentProjectId = projectId;
      this.getProjectInfo();
    });
    this.shared.togglePopup$.subscribe(({ event, taskId }) => {
    this.togglePopUp(event, taskId);

  });
  }

  getUsersProjectRole(projectId: number, userId: number) {
    this.myProjectsService.getUserProjectRole(projectId, userId).subscribe({
        next: (role) => {
            this.userRole = role;
        },
        error: (error) => {
            console.error('Failed to fetch user role', error);
        }
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
          this.projectTasks = tasks.filter(task => task.statusName !== 'Archived');
          this.allTasks=this.projectTasks;
          this.archivedTasks = tasks.filter(task => task.statusName === 'Archived');
          this.groupedTasks = this.groupTasksBySection(this.projectTasks);
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
      this.update.projectStatus = this.project.projectStatus;
      this.enabledEditorOptions = false;
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
    if(this.update.endDate)
      this.update.endDate = this.resetTime(this.update.endDate);
    
    this.spinner.show()
    if(this.userRole == 1 || this.userRole == 2 || this.userRole == 0)
    {
      if(this.update.projectName !== this.project.projectName || this.update.projectStatus!=this.project.projectStatus ||
        this.update.endDate != this.project.endDate || this.update.description != this.project.description)
      {
        if(this.update.projectStatus!==undefined)
            this.update.projectStatus = +this.update.projectStatus;

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

  filterSections() {
    if (this.searchSection.trim() !== '')
    {
      this.filteredSections = this.projectSections.filter(section =>
        section.sectionName.toLowerCase().includes(this.searchSection.toLowerCase())
      );
    }
    else {
      this.filteredSections = this.projectSections;
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
    const elementRef = document.getElementById('area-desc') as HTMLElement;
    if (popUp && !popUp.contains(event.target as Node) && this.showPopUp) {
      this.showPopUp = false;
      this.clickedTask = null;
    }
    else if (elementRef && !elementRef.contains(event.target as Node)) {
      this.enabledEditorOptions = false;
    }
  }

  closePopup() {
    this.clickedTask = null;
    this.showPopUp = false;
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

  async saveTask() {
    this.taskNameExists = false;
    this.buttonClicked = true;

    if(!this.newTaskName)
    {
        return;
    }

    if(await this.TaskNameExists())
      {
        this.taskNameExists = true;
        return;
      }

    if(this.newTaskStartDate == undefined || this.newTaskEndDate == undefined)
    {
      return;
    }

    // uklanja milisekunde
    this.newTaskStartDate = this.resetTime(this.newTaskStartDate);
    this.newTaskEndDate = this.resetTime(this.newTaskEndDate);


    if(this.isInvalidDate())
    {
      return;
    }

    if(this.newTaskName == undefined)
    {
      return;
    }
    if(this.selectedUser==undefined)
    {
      return;
    }

    this.buttonClicked = false;
    const task: NewTask = {
      CreatorId: Number(localStorage.getItem('id')),//treba mi da ne bih kreatoru slao da je dodelio sam sebi task ~maksim
      TaskName: this.newTaskName,
      Description: this.newTaskDescription,
      StartDate: this.newTaskStartDate || new Date(),
      EndDate: this.newTaskEndDate || new Date(),
      ProjectId: this.currentProjectId || 0,
      AppUserId: this.selectedUser?.appUserId || 0,
      ProjectSectionId: this.selectedSection?.id || 0
    };
    this.myTasksService.createTask(task).subscribe({
      next: () => {
        this.modalRef?.hide();
        this.getProjectInfo();
        this.shared.taskAdded(true);

        // Resetuj polja
        this.newTaskName = '';
        this.newTaskDescription = '';
        this.newTaskStartDate = null;
        this.newTaskEndDate = null;
        this.newTaskStatusId = null;
        this.newTaskProjectSectionId = null;
        this.selectedUser = undefined;
        this.selectedSection = undefined;
      },
      error: (error) => console.error('Error creating task:', error)
    });
  }

  // sklanja milisekunde
  resetTime(date: Date): Date {
    date.setHours(2, 0, 0, 0);
    return date;
  }

  // vraca AppUsers koji su na projektu
  getProjectsUsersAndSections(currentProjectId: number) {
    const noSection = { id: 0, sectionName: 'No Section', projectId:currentProjectId };
    this.myProjectsService.getUsersByProjectId(currentProjectId).subscribe({
      next: response => {
        this.users = response,
        this.users.forEach(user => {
          user.fullName = user.firstName + ' ' + user.lastName;
        });
      },
      error: error => console.log(error)
    });
    this.projectSectionService.getSectionsByProject(currentProjectId)
    .subscribe(sections => {
      this.projectSections = sections;
      this.projectSections.unshift(noSection);
    });

  }

  openNewTaskModal(modal: TemplateRef<void>) {
    this.buttonClicked=false;
    if (this.currentProjectId !== null)
    {
      this.getProjectsUsersAndSections(this.currentProjectId);
    }
    this.modalRef = this.modalService.show(
      modal,
      {
        class: 'modal-md modal-dialog-centered'
      });
  }

  openViewArchTaksModal(modal: TemplateRef<void>) {
    this.modalRef = this.modalService.show(
      modal,
      {
        class: 'modal-lg modal-dialog-centered'
      });
  }

  removeFromArchived() {
    this.spinner.show(); // prikazi spinner
    const selectedTaskIds = this.archivedTasks
      .filter(task => task.selected)
      .map(task => task.id);
    this.myTasksService.UpdateArchTasksToCompleted(selectedTaskIds).subscribe({
      next: () => {
        this.modalRef?.hide();
        this.getProjectInfo();
        this.shared.taskAdded(true);
        this.spinner.hide(); // skloni spinner
      },
      error: (error) => {
        console.error('Error updating tasks status:', error);
        this.spinner.hide(); // skloni spinner cak i ako dodje do greske
      }
    });
  }

  SelectedOwner(user: SelectedUser){
    if(this.selectedUsers.find(x => x.projectRole == 1 && x.appUserId != user.appUserId)){
      if(user.projectRole == 1)
        user.projectRole = 4
      return true
    }
    return false
  }

  OwnerAlreadyExists(userId: number){
    if(this.usersOnProject.find(x => x.projectRole == ProjectRole.ProjectOwner && x.appUserId!=userId))
      return true
    return false
  }

  openSectionModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-md modal-dialog-centered'
    });
    if (this.currentProjectId) {
      this.projectSectionService.getSectionsByProject(this.currentProjectId)
        .subscribe(sections => {
          this.projectSections = sections;
          this.filteredSections = this.projectSections;
        });
    }
  }

  deleteSection(sectionId: number) {
    this.projectSectionService.deleteSection(sectionId).subscribe(() => {
      this.projectSections = this.projectSections.filter(section => Number(section.id) !== sectionId);
      this.filteredSections = this.projectSections;
      this.shared.notifySectionUpdate();
    });
  }

  createNewSection() {
    if (this.newSectionName.trim() && this.currentProjectId !== null) {
      this.projectSectionService.createSection(this.newSectionName, this.currentProjectId).subscribe({
        next: (section) => {
          this.projectSections.push(section);
          this.shared.notifySectionUpdate();
          this.newSectionName = '';
        },
        error: (error) => {
          console.error('Error creating section:', error);
        }
      });
    }
  }
  async TaskNameExists()
  {
    try
    {
      var task = await this.myTasksService.TaskNameExists(this.newTaskName,this.project.id).toPromise();
      return task? true : false;
    }
    catch(error)
    {
      console.error("Error occurred while checking task name", error);
      return;
    }
  }
  isInvalidDate(): boolean {
    if(this.newTaskStartDate && this.newTaskEndDate){
      let startDate = new Date(this.newTaskStartDate);
      let currentDate = new Date();
      startDate.setHours(0,0,0,0);
      currentDate.setHours(0,0,0,0);
      return !(this.newTaskStartDate <= this.newTaskEndDate && (startDate>=currentDate));
    }
    return false;
  }
  showEditOptions(){
    this.enabledEditorOptions = true;
  }

  openArchiveProjectcModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered'
    });
  }
  
  openDeleteProjectcModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered'
    });
  }

  confirmArchive() {
    if (this.project && this.project.id) {
      this.myProjectsService.archiveProject(this.project.id).subscribe({
        next: () => {
          this.getProjectInfo(); // Refresh project info or navigate away
          this.modalRef?.hide();
          this.router.navigate(['/myprojects']).then(() => {
            this.toastr.success('Project has been archived.');
          });
        },
        error: error => {
          this.toastr.error('Failed to archive project');
        }
      });
    }
  }

 filterTasks():void{
    let filteredTasks = [...this.allTasks];

    if (this.searchText) {
      filteredTasks = filteredTasks.filter(task => {
        return task.taskName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          (`${task.firstName || ''} ${task.lastName || ''}`).toLowerCase().includes(this.searchText.toLowerCase());
      });
    }

    if (this.selectedStatus) {
      filteredTasks = filteredTasks.filter(task => task.statusName === this.selectedStatus);
    }

    if (this.rangeDates && this.rangeDates.length === 2) {
      const [startDate, endDate] = this.rangeDates;
      filteredTasks = filteredTasks.filter(task => {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = new Date(task.endDate);
        return taskStartDate >= startDate && taskEndDate <= endDate;
      });
    }

    this.projectTasks = filteredTasks;
    this.groupedTasks = this.groupTasksBySection(this.projectTasks); 
    if(this.searchText!='' || this.selectedStatus!='')
    {
      Object.keys(this.groupedTasks).forEach(section => {
          this.groupedTasks[section].visible = true;
      });
    }
 }
 SortByName(): void {
  this.sortOrderName = this.sortOrderName === 'asc' ? 'desc' : 'asc'; 
  
  this.projectTasks.sort((a, b) => {
      const nameA = a.taskName.toLowerCase();
      const nameB = b.taskName.toLowerCase();
      
      if (nameA < nameB) {
        return this.sortOrderName === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return this.sortOrderName === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
  this.groupedTasks = this.groupTasksBySection(this.projectTasks); 
  Object.keys(this.groupedTasks).forEach(section => {
    this.groupedTasks[section].visible = true;
  });
}
 SortByAssignee(): void {
  this.sortOrderAssignee = this.sortOrderAssignee === 'asc' ? 'desc' : 'asc'; 
  
  this.projectTasks.sort((a, b) => {
      const nameA = (a.firstName+" "+a.lastName).toLowerCase();
      const nameB = (b.firstName+" "+b.lastName).toLowerCase();
      
      if (nameA < nameB) {
        return this.sortOrderAssignee === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return this.sortOrderAssignee === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
  this.groupedTasks = this.groupTasksBySection(this.projectTasks); 
  Object.keys(this.groupedTasks).forEach(section => {
    this.groupedTasks[section].visible = true;
  });
}
 SortByStartDate(): void {
  this.sortOrderStartDate = this.sortOrderStartDate === 'asc' ? 'desc' : 'asc'; 
  
  this.projectTasks.sort((a, b) => {
      const nameA =new Date(a.startDate);
      const nameB = new Date(b.startDate);
      
      if (nameA < nameB) {
        return this.sortOrderStartDate === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return this.sortOrderStartDate === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
  this.groupedTasks = this.groupTasksBySection(this.projectTasks); 
  Object.keys(this.groupedTasks).forEach(section => {
    this.groupedTasks[section].visible = true;
  });
}
 SortByEndDate(): void {
  this.sortOrderEndDate = this.sortOrderEndDate === 'asc' ? 'desc' : 'asc'; 
  
  this.projectTasks.sort((a, b) => {
      const nameA =new Date(a.endDate);
      const nameB = new Date(b.endDate);
      
      if (nameA < nameB) {
        return this.sortOrderEndDate === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return this.sortOrderEndDate === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
  this.groupedTasks = this.groupTasksBySection(this.projectTasks); 
  Object.keys(this.groupedTasks).forEach(section => {
    this.groupedTasks[section].visible = true;
  });
}
 SortByStatus(): void {
  this.sortOrderStatus = this.sortOrderStatus === 'asc' ? 'desc' : 'asc'; 
  
  this.projectTasks.sort((a, b) => {
      const nameA =a.statusName;
      const nameB =b.statusName;
      
      if (nameA < nameB) {
        return this.sortOrderStatus === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return this.sortOrderStatus === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
  this.groupedTasks = this.groupTasksBySection(this.projectTasks); 
  Object.keys(this.groupedTasks).forEach(section => {
    this.groupedTasks[section].visible = true;
  });
}

}
  