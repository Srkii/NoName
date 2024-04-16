import { Component, ElementRef, OnInit, TemplateRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Priority, Project, ProjectStatus } from '../../Entities/Project';
import { MyTasksService } from '../../_services/my-tasks.service';
import { ProjectTask} from '../../Entities/ProjectTask';
import { NgxSpinnerService } from "ngx-spinner";
import { SelectedUser } from '../../Entities/SelectedUser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

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

  users: SelectedUser[] = [];
  selectedUsers: SelectedUser[] = [];

  constructor(
    private route: ActivatedRoute,
    private myProjectsService: MyProjectsService,
    private myTasksService: MyTasksService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
  ) {}

  ngOnInit(): void {
    this.getProjectInfo();
  }

  getProjectInfo() {
    this.spinner.show();
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.myProjectsService.getProjectById(+projectId).subscribe((project) => {
        this.project = project;
        this.myTasksService.GetTasksByProjectId(project.id).subscribe((tasks) => {
          this.projectTasks = tasks;
          this.groupedTasks = this.groupTasksBySection(tasks);
        });

        var userId = localStorage.getItem("id") ? Number(localStorage.getItem("id")) : -1
        this.myProjectsService.GetAvailableUsers(userId).subscribe(users => {
          this.users = users.map<SelectedUser>(user => ({ name: `${user.firstName} ${user.lastName}`, id: user.id, email: user.email, profilePicUrl: user.profilePicUrl,projectRole: 4}));
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
        class: "modal modal-dialog-centered"
      });

    const projectInfoModal = document.getElementById("projectInfo");
    let daysLeft = document.getElementById("daysLeft")
    let startDate = document.getElementById("startDate") as HTMLInputElement
    let endDate = document.getElementById("endDate") as HTMLInputElement
    let projectStatus = document.getElementById("projectStatus") as HTMLSelectElement
    let projectPrioriy = document.getElementById("projectPriority") as HTMLSelectElement

    if(this.project)
    {
      startDate.value = new Date(this.project?.startDate).toISOString().split('T')[0]
      endDate.value = new Date(this.project?.endDate).toISOString().split('T')[0]
    }

    if(this.project && projectStatus && projectPrioriy)
    {
      var status = +this.project.projectStatus;
      for (let option of Array.from(projectStatus.options)) {
        if (option.value === status.toString()) {
          option.selected = true;
          break;
        }
      }
      var priority = +this.project.priority;
      for (let option of Array.from(projectPrioriy.options)) {
        if (option.value === priority.toString()) {
          option.selected = true;
          break;
        }
      }
    }
  }
  closeProjectInfo(){
    const projectInfoModal = document.getElementById("projectInfo");
    if(projectInfoModal!=null)
    {
      projectInfoModal.style.display = 'none';
    }
  }
}
