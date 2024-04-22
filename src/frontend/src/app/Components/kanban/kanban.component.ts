import { Component, OnInit, TemplateRef, Output, EventEmitter  } from '@angular/core';
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

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css'
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
    public uploadservice: UploadService
  ) {}

  ngOnInit() {
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
    if(modalSize === 'newSection')
      modalClass = 'modal-sm modal-dialog-centered';
    else if (modalSize === 'newTask')
    modalClass = 'modal-lg modal-dialog-centered';
    this.modalRef = this.modalService.show(
      modal,
      {
        class: modalClass
      });
  }
  deleteSectionFunction() {
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
  saveSection() {
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
      error: (error) => console.error('Error adding task status:', error)
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
        //this.loadPicture(this.users);
      },
      error: error => console.log(error)
    });
  }
  openArchivedTasksModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  // za uzimanje slike. mora ovako za sad...
  // loadPicture(usersArray: TaskAssignee[]) : void{
  //   usersArray.forEach(user => {
  //     if(user.profilePicUrl!='' && user.profilePicUrl!=null){ //ovde je bilo !=null, a treba ovako
  //     this.uploadservice.getImage(user.profilePicUrl).subscribe(
  //       url => {
  //         user.pictureUrl = url;
  //       }
  //       )
  //     }
  //   });
  // }
}
