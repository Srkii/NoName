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
import { UserinfoService } from '../../_services/userinfo.service';

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
  user!:any;

  constructor(private myTasksService: MyTasksService,private cdr: ChangeDetectorRef,private userInfo:UserinfoService) {}

  ngOnInit(): void {
    if (this.task) {
      // Store the initial task status to revert back if needed
      this.previousTaskStatus = this.task.statusName;
    }
    this.getUser();
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
    
    // Update the task status on the server
    this.myTasksService.updateTaskStatus1(task.id, newStatus).subscribe({
      next: (updatedTask: ProjectTask) => {
        this.taskUpdated.emit(updatedTask); // Emit the updated task
      },
      error: (error: any) => {
        console.error('Error updating task status:', error);
      }
    });
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
    const description = document.querySelector('.description') as HTMLElement;
    const windowWidth= window.innerWidth;
    if (!this.fullscreen) {
      console.log(windowWidth);
      if(windowWidth<1200)
      {
        pop.style.top="0";
        pop.style.height="100%";
      }
      else
      {
        pop.style.top="";
        pop.style.height="";
      }
      pop.style.width = '99%';
      pop.style.padding = '2%';
      back.style.marginRight = '1%';
      full.style.marginRight = '3%';
      file.style.marginRight = '3%';
      comments.style.marginTop = '3%';
      description.style.marginTop = '-3%';
      comments.style.marginTop = '2.3%';
      comments.style.width = '100%';
      this.fullscreen = true;
    } else {
      pop.style.top="";
      pop.style.height="";
      pop.style.width = '';
      pop.style.padding = '';
      back.style.marginRight = '';
      full.style.marginRight = '';
      file.style.marginRight = '';
      comments.style.marginTop = '';
      description.style.marginTop = '-3%';
      comments.style.marginTop = '';
      this.fullscreen = false;
    }
  }
  getUser(): void{
    var id=localStorage.getItem('id')
    this.userInfo.getUserInfo2(id).subscribe({
      next:(response)=>{
        this.user=response;
        console.log(this.user);
      },error:(error)=>{
        console.log(error)
      }
      
    })
  }
}
