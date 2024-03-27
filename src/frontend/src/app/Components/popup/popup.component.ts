import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ProjectTask, TaskStatus } from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';
import { MyTasksComponent } from '../my-tasks/my-tasks.component';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() task: ProjectTask | null = null;
  @Output() taskUpdated: EventEmitter<ProjectTask> =
    new EventEmitter<ProjectTask>();
  @Output() backClicked: EventEmitter<void> = new EventEmitter<void>();

  previousTaskStatus: TaskStatus | null = null;
  fullscreen: boolean = false;

  constructor(private myTasksService: MyTasksService) {}

  ngOnInit(): void {
    if (this.task) {
      // Store the initial task status to revert back if needed
      this.previousTaskStatus = this.task.taskStatus;
    }
  }

  toggleTaskCompletion(event: any, task: ProjectTask): void {
    event.stopPropagation();
    if (
      task.taskStatus === TaskStatus.InProgress ||
      task.taskStatus === TaskStatus.Proposed
    ) {
      this.previousTaskStatus = task.taskStatus;
      task.taskStatus = TaskStatus.Completed;
    } else {
      if (this.previousTaskStatus !== null) {
        task.taskStatus = this.previousTaskStatus;
        this.previousTaskStatus = null;
      } else {
        task.taskStatus = TaskStatus.InProgress;
      }
    }
    // Update the task status on the server
    this.myTasksService.updateTaskStatus(task.id, task).subscribe(
      (updatedTask: ProjectTask) => {
        // Optionally, handle the updated task response from the server
        console.log('Task status updated successfully:', updatedTask);
        // Emit the updated task to notify the parent component
        this.taskUpdated.emit(updatedTask);
      },
      (error: any) => {
        // Handle any errors that occur during the update process
        // console.error('Error updating task status:', error);
      }
    );
  }

  triggerFileInput(): void {
    // Programmatically click the hidden file input
    this.fileInput.nativeElement.click();
  }

  handleFileInput(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const file = files[0];
      // Handle the file processing here
      console.log(file);
    }
  }

  close() {
    this.backClicked.emit(); // Emit event when back button is clicked
    this.task = null;
  }
  full() {
    const pop = document.querySelector('.pop') as HTMLElement;
    const back = document.querySelector('.back') as HTMLElement;
    const full = document.querySelector('.full') as HTMLElement;
    const file = document.querySelector('.file') as HTMLElement;
    const comments = document.querySelector('.comments') as HTMLElement;
    const assignees = document.querySelector('.assignees') as HTMLElement;
    const mark = document.querySelector('.mark') as HTMLElement;

    if (!this.fullscreen) {
      pop.style.width = '98.5%';
      pop.style.padding = '2%';
      back.style.marginRight = '1%';
      full.style.marginRight = '3%';
      file.style.marginRight = '3%';
      comments.style.marginTop = '3%';
      assignees.style.marginTop = '-3%';
      comments.style.marginTop = '1.9%';
      comments.style.width = '100%';
      mark.style.marginTop = '-1.4%';
      this.fullscreen = true;
    } else {
      pop.style.width = '';
      pop.style.padding = '';
      back.style.marginRight = '';
      full.style.marginRight = '';
      file.style.marginRight = '';
      comments.style.marginTop = '';
      comments.style.marginTop = '';
      mark.style.marginTop = '';
      this.fullscreen = false;
    }
  }
}
