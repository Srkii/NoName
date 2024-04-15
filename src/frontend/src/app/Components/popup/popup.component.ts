import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { ProjectTask } from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';
import { UserinfoService } from '../../_services/userinfo.service';
import { CommentsService } from '../../_services/comments.service'; // Import CommentsService
import { Comment } from '../../Entities/Comments'; // Import Comment model
import { DatePipe, formatDate } from '@angular/common';
import { AppUser } from '../../Entities/AppUser';
import { MyProjectsService } from '../../_services/my-projects.service';
import { TaskAssignee } from '../../Entities/TaskAssignee';
import { Project } from '../../Entities/Project';
import { coerceStringArray } from '@angular/cdk/coercion';
import { UploadService } from '../../_services/upload.service';
import { ChangeTaskInfo } from '../../Entities/ChangeTaskInfo';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('commentInput') commentInput!: ElementRef;
  @Input() task: ProjectTask | null = null;
  @Output() taskUpdated: EventEmitter<void> =
    new EventEmitter<void>();
  @Output() backClicked: EventEmitter<void> = new EventEmitter<void>();

  previousTaskStatus: string="";
  fullscreen: boolean = false;
  user!:any;
  comments: Comment[] = []; 
  users: TaskAssignee[] = [];
  userId=localStorage.getItem('id');
  selectedUser: TaskAssignee | undefined;
  selectedProject: any;
  showButton: boolean=false;
  editCommet_id: number=-1;


  constructor(private myTasksService: MyTasksService,private cdr: ChangeDetectorRef,private userInfo:UserinfoService,  private commentsService: CommentsService,private myProjectsService: MyProjectsService,    private uploadservice: UploadService){}

  ngOnChanges(changes: SimpleChanges): void {
    if ('task' in changes && this.task) {

      this.selectedProject = this.task.project;
      this.getUser();
      this.fetchComments();
      this.getProjectsUsers(this.task.projectId);
      document.addEventListener('click', this.documentClick.bind(this));
    }
  }
  // ngOnInit(): void {
  //   if (this.task) {
  //     this.previousTaskStatus = this.task.statusName;
  //     this.selectedProject=this.task.project;
  //     this.getUser();
  //     this.fetchComments();
  //     this.getProjectsUsers(this.task?.projectId);
  //     this.getUserProjects(this.userId);
  //   }
      
  // }

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
    var previousTaskStatus = "";
    if (task.statusName === 'InProgress' || task.statusName == 'Proposed') {
      previousTaskStatus = task.statusName;
      task.statusName = 'InReview';
    } else {
      if(previousTaskStatus!="")
        task.statusName = previousTaskStatus;
      else
        task.statusName = 'InProgress';
    }
    console.log(task.statusName)
    this.myTasksService.updateTaskStatus1(task.id,task.statusName).subscribe({
      next: () => {
        this.taskUpdated.emit();
      },
      error: (error: any) => {
        console.error('Error toggling task completion:', error);
      }
    });
  }
    
  
  
  

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  handleFileInput(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const file = files[0];
    }
  }

  close() {
    this.backClicked.emit();
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
        this.user.fullName = this.user.firstName + ' ' + this.user.lastName;
        this.selectedUser=this.user;
        if (this.selectedUser) {
          this.selectedUser.appUserId = this.user.id;
          this.selectedUser.lastName = this.user.lastName;
          this.selectedUser.firstName = this.user.firstName;
          this.selectedUser.fullName = this.user.fullName;
          this.selectedUser.profilePicUrl = this.user.profilePicUrl;
        }
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
        senderId: this.user.id,
        senderFirstName: this.user.firstName,
        senderLastName: this.user.lastName,
        messageSent:  new Date 
      };
  
      this.commentsService.postComment(commentDto).subscribe({
        next: (comment: Comment) => {
          commentDto.id = comment.id;
          this.comments.push(commentDto);
          this.commentInput.nativeElement.value = '';
        },
        error: (error: any) => {
          console.error('Error adding comment:', error);
        }
      });
    }

  }

  CheckForCommets(task: ProjectTask): boolean {
    const hasComments = this.comments.some(comment => comment.taskId === task.id);
    return hasComments;
  }
  deleteComment(commentId: number): void {
    this.commentsService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(comment => comment.id !== commentId);
      },
      error: (error: any) => {
        console.error('Error deleting comment:', error);
      }
    });
  }
  getProjectsUsers(currentProjectId: any) {
    this.myProjectsService.getUsersByProjectId(currentProjectId).subscribe({
      next: response => {
        this.users = response,
        this.users.forEach(user => {
          user.fullName = user.firstName + ' ' + user.lastName;
          this.loadPicture(this.users);
        });
      },
      error: error => console.log(error)
    });
  }

  loadPicture(usersArray: TaskAssignee[]) : void{
    usersArray.forEach(user => {
      if(user.profilePicUrl!='' && user.profilePicUrl!=null){ //ovde je bilo !=null, a treba ovako
      this.uploadservice.getImage(user.profilePicUrl).subscribe(
        { next: (res) => {
          const reader = new FileReader();
          reader.readAsDataURL(res);
          reader.onloadend = ()=> {
            user.pictureUrl=reader.result as string;
        }},
        error:(error) => {
          console.log(error);
          }}
        )
      }
    });
  }


  updateTaskInfo(task: ProjectTask): void {
    const dto: ChangeTaskInfo = {
      id: task.id,
      taskName: task.taskName,
      description: task.description,
      projectId: this.selectedProject.id,
      appUserId: this.selectedUser?.appUserId,
      dueDate: task.endDate 
    };

    this.myTasksService.changeTaskInfo(dto).subscribe({
      next: (updatedTask: ProjectTask) => {
        console.log(this.task);
        this.task = updatedTask;
        console.log(task.projectRole);

        this.taskUpdated.emit();
        console.log(updatedTask)

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error updating task information:', error);
      }
    });
  }

  updateTaskDueDate(event:Event): void {
    const dueDateString = (event.target as HTMLInputElement).value;
    const dueDate = new Date(dueDateString);

    if (this.task) {
      this.task.endDate = dueDate;

      this.updateTaskInfo(this.task);
    }
  }

  ShowEdit(comment:Comment):void{
    this.commentInput.nativeElement.value = comment.content;
    this.showButton=true;
    this.editCommet_id=comment.id;
  }

  editContent(): void {
    const editedContent = this.commentInput.nativeElement.value.trim();
    console.log(typeof(editedContent))
      
  
    this.commentsService.updateComment(this.editCommet_id, editedContent).subscribe({
        next: () => {
          this.showButton = false;
          this.commentInput.nativeElement.value = "";
          this.fetchComments();
        },
        error: (error: any) => {
          console.error('Error updating comment:', error);
        }
      });
  }

  CancelEdit():void{
    this.showButton=false;
    this.commentInput.nativeElement.value = "";
  }

  documentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!(target.closest('.content') || target === this.commentInput.nativeElement)) {
      this.showButton = false;
      this.commentInput.nativeElement.value = "";
      this.editCommet_id = -1;
    }
  }
  

  


  
  
}
