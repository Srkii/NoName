import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ProjectTask} from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';

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

  previousTaskStatus: string="";
  fullscreen: boolean = false;

  constructor(private myTasksService: MyTasksService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.task) {
      // Store the initial task status to revert back if needed
      this.previousTaskStatus = this.task.statusName;
    }
  }

  toggleTaskCompletion(event: any, task: ProjectTask): void {
    event.stopPropagation();
    let newStatus: string;
  
    if (task.statusName === "InProgress" || task.statusName === "InReview") {
      this.previousTaskStatus = task.statusName;
      newStatus = "Completed";
    } else {
      if (this.previousTaskStatus !== "") {
        newStatus = this.previousTaskStatus;
        this.previousTaskStatus = "";
      } else {
        newStatus = "InReview";
      }
    }
  
    // Update the task status locally if it's changed
    if (task.statusName !== newStatus) {
      task.statusName = newStatus;
  
      // Update the task status on the server
      this.myTasksService.updateTaskStatus(task.id, newStatus).subscribe(
        (updatedTask: ProjectTask) => {
          console.dir(task);
          this.cdr.detectChanges();
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
      this.fullscreen = true;
    } else {
      pop.style.width = '';
      pop.style.padding = '';
      back.style.marginRight = '';
      full.style.marginRight = '';
      file.style.marginRight = '';
      comments.style.marginTop = '';
      comments.style.marginTop = '';
      this.fullscreen = false;
    }
  }
}
