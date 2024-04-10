import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ProjectTask } from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';
import { UserinfoService } from '../../_services/userinfo.service';
import { CommentsService } from '../../_services/comments.service'; // Import CommentsService
import { Comment } from '../../Entities/Comments'; // Import Comment model

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('commentInput') commentInput!: ElementRef;
  @Input() task: ProjectTask | null = null;
  @Output() taskUpdated: EventEmitter<ProjectTask> =
    new EventEmitter<ProjectTask>();
  @Output() backClicked: EventEmitter<void> = new EventEmitter<void>();

  previousTaskStatus: string="";
  fullscreen: boolean = false;
  user!:any;
  comments: Comment[] = []; // Array to store comments

  constructor(private myTasksService: MyTasksService,private cdr: ChangeDetectorRef,private userInfo:UserinfoService,  private commentsService: CommentsService) {}

  ngOnInit(): void {
    if (this.task) {
      // Store the initial task status to revert back if needed
      this.previousTaskStatus = this.task.statusName;
    }
    this.getUser();
    this.fetchComments();
  }

  fetchComments(): void {
    if (this.task && this.task.id) {
      this.commentsService.getComments(this.task.id).subscribe({
        next: (comments: Comment[]) => {
          this.comments = comments;
        },
        error: (error: any) => {
          console.error('Error fetching comments:', error);
        }
      });
    }
  }


  toggleTaskCompletion(task: ProjectTask): void {
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

    this.taskUpdated.emit(task);
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
    }
  }

  close() {
    this.backClicked.emit(); // Emit event when back button is clicked
    this.task = null;
  }
  full() {
    const container1 = document.querySelector('.container1') as HTMLElement;
    const pop=document.querySelector(".col-md-5") as HTMLElement;
    const back = document.querySelector('.back') as HTMLElement;
    const full = document.querySelector('.full') as HTMLElement;
    const file = document.querySelector('.file') as HTMLElement;
    const comments = document.querySelector('.comments') as HTMLElement;
    const description = document.querySelector('.description') as HTMLElement;
    const windowWidth= window.innerWidth;
    if (!this.fullscreen) {
      if(windowWidth<800)
      {
        // pop.style.top="0";
        pop.style.height="100%";
        pop.style.width="95%";
      }
      if(windowWidth<600)
        {
          pop.style.height="100%";
          pop.style.width="90%";
        }
      else
      {
        pop.style.top="";
        pop.style.height="";
      }
      pop.style.width="98%";
      pop.style.padding = '2%';
      back.style.marginRight = '1%';
      full.style.marginRight = '3%';
      file.style.marginRight = '3%';
      description.style.marginTop = '-3%';
      comments.style.marginTop = '0%';
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
      description.style.marginTop = '';
      comments.style.marginTop = '';
      this.fullscreen = false;
    }
  }
  getUser(): void{
    var id=localStorage.getItem('id')
    this.userInfo.getUserInfo2(id).subscribe({
      next:(response)=>{
        this.user=response;
      },error:(error)=>{
        console.log(error)
      }
      
    })
  }

  addComment(): void {
    const content = this.commentInput.nativeElement.value.trim();
    if (content) {
      const commentDto: Comment = {
        id: -1,
        taskId: this.task!.id,
        content: content,
        senderId: this.user.id, // Assuming user is logged in and you have access to user info
        senderFirstName: this.user.firstName,
        senderLastName: this.user.lastName,
        messageSent: new Date() // Set the messageSent property to the current date
      };
  
      this.commentsService.postComment(commentDto).subscribe({
        next: (comment: Comment) => {
          // Replace temporary id with the actual id returned from the server
          commentDto.id = comment.id;
          // Add the newly added comment to the comments list
          this.comments.push(commentDto);
          // Clear the textarea
          this.commentInput.nativeElement.value = '';
          // Reset textarea height
        },
        error: (error: any) => {
          console.error('Error adding comment:', error);
        }
      });
    }
  }
  
}
