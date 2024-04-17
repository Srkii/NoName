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
import { Member } from '../../Entities/Member';
import { DatePipe } from '@angular/common';
import { ProjectRole } from '../../Entities/ProjectMember';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | undefined;
  projectTasks: ProjectTask[] = [];
  viewMode: string = 'table';
  modalRef?: BsModalRef;
  groupedTasks: { [key: string]: any } = {};

  update: UpdateProject = {};
  selectedUsers: SelectedUser[] = [];
  usersOnProject: SelectedUser[] = [];
  addableUsers: SelectedUser[] = [];
  userId: number = -1;

  constructor(
    private route: ActivatedRoute,
    private myProjectsService: MyProjectsService,
    private myTasksService: MyTasksService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private datePipe: DatePipe
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

        this.myProjectsService.getUsersByProjectId(project.id).subscribe((users: any[]) => {
          console.log(users)
          this.usersOnProject = users.map<SelectedUser>(user => ({ name: `${user.firstName} ${user.lastName}`, appUserId: user.appUserId, email: user.email, profilePicUrl: user.profilePicUrl,projectRole: +ProjectRole}));
          console.log(this.usersOnProject)
        });

        this.myProjectsService.GetAddableUsers(project.id).subscribe((users: any[]) => {
          this.addableUsers = users.map<SelectedUser>(user => ({ name: `${user.firstName} ${user.lastName}`, appUserId: user.appUserId, email: user.email, profilePicUrl: user.profilePicUrl,projectRole: ProjectRole.Guest}));
        });
       
        this.spinner.hide();
      });
    }
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
  
    this.update.appUserId = this.userId;
    this.update.projectName = this.project?.projectName;
    this.update.description = this.project?.description;
    this.update.startDate = this.project?.startDate;
    this.update.endDate = this.project?.endDate;
    this.update.priority = this.project?.priority;
    this.update.projectStatus = this.project?.projectStatus;
  }

  updateProject()
  {
    if(this.update.priority && this.update.projectStatus)
    {
      this.update.priority = +this.update.priority
      this.update.projectStatus = +this.update.projectStatus
      console.log(this.userId)
      console.log(this.usersOnProject)
    }
    this.myProjectsService.UpdateProject(this.update).subscribe(updatedProject => {
      this.ngOnInit()
    })
  }

}
