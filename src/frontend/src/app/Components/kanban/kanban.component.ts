import { Component, OnInit, TemplateRef  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { MyTasksService } from '../../_services/my-tasks.service';
import { ProjectTask } from '../../Entities/ProjectTask';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

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

  constructor(
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private myTasksService: MyTasksService,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.GetTaskStatuses();
    const projectId = this.route.snapshot.paramMap.get('id');
    this.currentProjectId = projectId ? +projectId : null;
    this.populateTasks();
    this.spinner.hide();
  }

  populateTasks() {
    if (this.currentProjectId) {
      this.myTasksService.GetTasksByProjectId(this.currentProjectId).subscribe((tasks) => {
        this.tasks = tasks;
        this.groupTasksByStatus();
        console.log(this.tasksBySection);
      });
    }
  }

  GetTaskStatuses() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.myTasksService.GetTaskStatuses(+projectId).subscribe((statuses) => {
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
    // samo prvo preblacenje nece da radi. sledece hoce
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
  openModal(modal: TemplateRef<void>, modalType: string) {
    const modalClass = modalType === 'newSection' ? 'modal-sm modal-dialog-centered' : 'modal-lg modal-dialog-centered';
    this.modalRef = this.modalService.show(
      modal,
      {
        class: modalClass
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
      next: (response) => {
        console.log('Task status added:', response);
        this.modalRef?.hide(); // za skrivanje modala
      },
      error: (error) => console.error('Error adding task status:', error)
    });
  }
}