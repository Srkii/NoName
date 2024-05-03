import { Component, OnInit, TemplateRef, Output, EventEmitter, HostListener, ViewChild, ElementRef, Renderer2  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { MyTasksService } from '../../_services/my-tasks.service';
import { ProjectTask } from '../../Entities/ProjectTask';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TaskAssignee } from '../../Entities/TaskAssignee';
import { MyProjectsService } from '../../_services/my-projects.service';
import { UploadService } from '../../_services/upload.service';
import { NewTask } from '../../Entities/NewTask';

import { forkJoin } from 'rxjs';
import { SharedService } from '../../_services/shared.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css',
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
export class KanbanComponent implements OnInit{
  tasks: any[] = [];
  taskStatuses: any[] = [];
  tasksBySection: { [key: string]: ProjectTask[] } = {};
  taskStatusNames: string[] = [];
  modalRef?: BsModalRef;
  newSectionName: string = '';
  currentProjectId: number | null = null;
  newSectionColor: string = '#ffffff'; // default boja

  // Section koji ce biti obrisan
  currentSectionName: string = '';
  currentSectionId: number | null = null;

  newTaskName: string = '';
  newTaskDescription: string = '';
  newTaskStartDate: Date | null = null;
  newTaskEndDate: Date | null = null;
  newTaskStatusId: number | null = null;
  newTaskProjectSectionId: number | null = null;
  selectedArchivedTasks: any[] = [];

  userId: number = -1;
  clickedTask: ProjectTask | null = null;
  showPopUp: boolean = false;
  task!: ProjectTask;

  users: TaskAssignee[] = [];
  selectedUser: TaskAssignee | undefined;;
  filterValue: string | undefined = '';

  @Output() sectionChanged = new EventEmitter<boolean>();

  constructor(
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private myTasksService: MyTasksService,
    private modalService: BsModalService,
    private myProjectsService: MyProjectsService,
    public uploadservice: UploadService,
    private shared: SharedService,
    private toastr: ToastrService
  ) {}



  ngOnInit() {
    this.spinner.show();
    this.shared.taskUpdated.subscribe(() => {
      this.loadTasksAndUsers();  // Reload tasks and users
    });
    this.populateTasks();
    if (this.currentProjectId !== null) {
      this.getProjectsUsers(this.currentProjectId);
    }

    this.spinner.hide();
  }


  loadTasksAndUsers():void{
    this.spinner.show();
    this.populateTasks();
    if (this.currentProjectId !== null) {
      this.getProjectsUsers(this.currentProjectId);
    }
    this.spinner.hide();
  }

  populateTasks() {
    const projectId = this.route.snapshot.paramMap.get('id');
    this.currentProjectId = projectId ? +projectId : null;
    this.GetTaskStatuses();
    if (this.currentProjectId) {
      this.myTasksService.GetTasksByProjectId(this.currentProjectId).subscribe((tasks) => {
        this.tasks = tasks;
        this.groupTasksByStatus();
      });
    }
  }

  GetTaskStatuses() {
    if (this.currentProjectId) {
      this.myTasksService.GetTaskStatuses(this.currentProjectId).subscribe((statuses) => {
        this.taskStatuses = statuses;
        this.taskStatuses.sort((a, b) => a.position - b.position);
      });
    }
  }

  groupTasksByStatus() {
    this.tasksBySection = this.tasks.reduce((acc, task) => {
      const statusName = task.statusName;
      if (!acc[statusName]) {
        acc[statusName] = [];
      }
      acc[statusName].push(task);
      return acc;
    }, {});
    this.taskStatuses.forEach(status => {
      if (!this.tasksBySection[status.name]) {
        this.tasksBySection[status.name] = [];
      }
    });
    console.log(this.tasksBySection);
  }

  drop(event: CdkDragDrop<ProjectTask[]>) {
    // kad nece da prevuce ukoliko se odmah nakon pokretanja servera zabaguje
    // samo prvo prevlacenje nece da radi. sledece hoce
    if (!event.previousContainer.data || !event.container.data) {
      this.populateTasks();
      return;
    }
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      const task = event.item.data;
      const newStatus = this.taskStatuses.find(s => s.name === event.container.id);
      if (task && newStatus) {
        task.taskStatusId = newStatus.id;
        this.myTasksService.updateTicoTaskStatus(task.id, task).subscribe();
      }
    }
  }

  dropColumn(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(this.taskStatuses, event.previousIndex, event.currentIndex);
    this.updateTaskStatusPositions();
  }

  updateTaskStatusPositions() {
    const updatedStatuses = this.taskStatuses.map((status, index) => ({ ...status, position: index }));
    this.myTasksService.updateTaskStatusPositions(updatedStatuses).subscribe(() => {
      this.GetTaskStatuses();
    });
  }
  openDeleteStatusModal(modal: TemplateRef<void>, sectionName: string = '', sectionId: number) {
    this.currentSectionName = sectionName;
    this.currentSectionId = sectionId;
    this.modalRef = this.modalService.show(
      modal,
      {
        class: 'modal-sm modal-dialog-centered'
      });
  }
  openSimpleModal(modal: TemplateRef<void>, modalSize: string) {
    let modalClass = '';
    if(modalSize === 'newBoard')
      modalClass = 'modal-sm modal-dialog-centered';
    else if (modalSize === 'newTask' || modalSize === 'archivedTasks')
    modalClass = 'modal-lg modal-dialog-centered';
    this.modalRef = this.modalService.show(
      modal,
      {
        class: modalClass
      });
    this.tasksBySection['Archived'].forEach(task => task.selected = false); // resetuj task.selection chekbox u remove arch tasks
  }
  deleteBoardFunction() {
    if (this.currentSectionId === null) {
      console.error('Section ID is null');
      return;
    }
    this.myTasksService.deleteTaskStatus(this.currentSectionId).subscribe({
      next: () => {
        this.modalRef?.hide();
        this.sectionChanged.emit(true);
        this.populateTasks();
      },
      error: (error) => console.error('Error deleting section:', error)
    });
  }
  saveNewBoard() {
    if (this.currentProjectId === null) {
      console.error('Project ID is null');
      return;
    }
    const taskStatus = {
      statusName: this.newSectionName,
      projectId: this.currentProjectId,
      color: this.newSectionColor
    };
    this.myTasksService.addTaskStatus(taskStatus).subscribe({
      next: () => {
        this.modalRef?.hide(); // za skrivanje modala
        this.newSectionName = '';
        this.newSectionColor = '#ffffff';
        this.sectionChanged.emit(true);
        this.populateTasks();
      },
      error: (error) => this.toastr.error(error.error)
    });
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
        this.modalRef?.hide()
        this.sectionChanged.emit(true);
        this.populateTasks();
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
  removeFromArchived() {
    this.spinner.show(); // prikazi spinner
    const selectedTaskIds = this.tasksBySection['Archived']
      .filter(task => task.selected)
      .map(task => task.id);
    this.myTasksService.UpdateArchTasksToCompleted(selectedTaskIds).subscribe({
      next: () => {
        this.modalRef?.hide();
        this.populateTasks(); // ucitavam promene
        this.spinner.hide(); // skloni spinner
      },
      error: (error) => {
        console.error('Error updating tasks status:', error);
        this.spinner.hide(); // skloni spinner cak i ako dodje do greske
      }
    });
  }

  onTaskClick(event: MouseEvent, taskId: number) {
    event.stopPropagation(); 
    this.shared.triggerPopup(event, taskId);
  }

}
