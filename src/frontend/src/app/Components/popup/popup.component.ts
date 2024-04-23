import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef, SimpleChanges, inject } from '@angular/core';
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
import { NavigationExtras, Router } from '@angular/router';
import { TaskDependency } from '../../Entities/TaskDependency';
import { ThisReceiver, TmplAstIdleDeferredTrigger } from '@angular/compiler';
import { addSeconds } from 'date-fns';

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
  @Output() projectClicked: EventEmitter<number> = new EventEmitter<number>();

  previousTaskStatus: string="";
  fullscreen: boolean = false;
  user!:any;
  comments: Comment[] = [];
  users: TaskAssignee[] = [];
  userId=localStorage.getItem('id')|| "";
  selectedUser: TaskAssignee | undefined;
  selectedProject: any;
  appUserId=parseInt(this.userId);
  tasks: ProjectTask[]=[];
  selectedTasks: number[]=[];
  deletedTask:boolean=false;
  allDependencies:TaskDependency[]=[];
  


  constructor(private myTasksService: MyTasksService,private cdr: ChangeDetectorRef,private userInfo:UserinfoService,  private commentsService: CommentsService,private myProjectsService: MyProjectsService,    public uploadservice: UploadService, private router: Router){}

  ngOnChanges(changes: SimpleChanges): void {
    if ('task' in changes && this.task) {
      
      // const dependencies : number[] = []

      // if (this.task.dependencies) {
      //   for (const [key, value] of Object.entries(this.task.dependencies)) {
      //     for (const [key1, value1] of Object.entries(value)) {
      //       if(key1 == "dependencyTaskId")
      //         {
      //           dependencies.push(Number(value1))
      //         }
      //     }
      //   }
      // } else {
      //   console.log("this.task.dependencies is undefined");
      // }
      if (Array.isArray(this.task.dependencies)) {
        this.selectedTasks = [...this.task.dependencies];
      } else {
        this.selectedTasks = [];
      }
      

      


      if (this.task.projectRole === undefined || this.task.projectRole === null) {
        console.error('Task does not have projectRole property');
      } else {
      }
      this.selectedProject = this.task.project;
      this.getUser();
      this.fetchComments();
      this.getProjectsUsers(this.task.projectId);
      this.getAllTasks();
      this.getAllTasksDependencies();
      
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
          console.log(this.comments[0]);

        },
        error: (error: any) => {
          console.error('Error fetching comments:', error);
        }
      });
    }
  }


  toggleTaskCompletion(task: ProjectTask): void {
    var previousTaskStatus = "";
    if (task.statusName != 'InReview') {
      previousTaskStatus = task.statusName;
      task.statusName = 'InReview';
    } else {
      if(previousTaskStatus!="")
        task.statusName = previousTaskStatus;
      else
        task.statusName = 'InProgress';
    }
    
      
    this.myTasksService.updateTaskStatus1(task.id,task.statusName).subscribe({
      next: () => {
        this.myTasksService.GetAllTasksDependencies().subscribe((deps: TaskDependency[]) => {
            const closed_deps:TaskDependency[]=deps.filter(dep=>dep.dependencyTaskId==this.task?.id);
            closed_deps.forEach(closed => {
              const deleteDto: TaskDependency = {
                taskId: closed.taskId,
                dependencyTaskId: task.id
              };
        
              this.myTasksService.deleteTaskDependency(deleteDto).subscribe(() => {
                console.log('Dependency deleted successfully');
              }, (error: any) => {
                console.error('Error deleting dependency:', error);
              });
        });
          
        });
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
    const exit_full = document.querySelector('.exit_full') as HTMLElement;
    const file = document.querySelector('.file') as HTMLElement;
    const comments = document.querySelector('.comments') as HTMLElement;
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
      exit_full.style.marginRight = '3%';
      exit_full.style.display = 'block';
      full.style.display = 'none';
      file.style.marginRight = '3%';
      comments.style.marginTop = '0%';
      comments.style.width = '100%';
      this.fullscreen = !this.fullscreen;
    } else {
      pop.style.top="";
      pop.style.height="";
      pop.style.width = '';
      pop.style.padding = '';
      back.style.marginRight = '';
      exit_full.style.marginRight = '';
      exit_full.style.display = 'none';
      full.style.display = '';
      file.style.marginRight = '';
      comments.style.marginTop = '';
      comments.style.marginTop = '';
      this.fullscreen = !this.fullscreen;
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
        messageSent:  new Date,
        edited:false,
      };

      this.commentsService.postComment(commentDto).subscribe({
        next: (comment: Comment) => {
          commentDto.id = comment.id;
          this.comments.push(commentDto);
          this.commentInput.nativeElement.value = '';

          // Use setTimeout to ensure that the scroll occurs after the new comment has been rendered
        setTimeout(() => {
          this.scrollToBottom();
        });

        },
        error: (error: any) => {
          console.error('Error adding comment:', error);
        }
      });
    }

  }
  scrollToBottom(): void {
    const commentsDiv = document.querySelector('.scroll');
    if (commentsDiv) {
      commentsDiv.scrollTop = commentsDiv.scrollHeight;
    }
  }

  CheckForCommets(task: ProjectTask): boolean {
    const hasComments = this.comments.some(comment => comment.taskId === task.id);
    return hasComments;
  }
  deleteComment(commentId: number): void {
    const isConfirmed = confirm("Are you sure you want to delete this comment?");
    if (isConfirmed) {
      // If confirmed, proceed with deletion
      this.commentsService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments = this.comments.filter(comment => comment.id !== commentId);
        },
        error: (error: any) => {
          console.error('Error deleting comment:', error);
        }
      });
    }
  }
  getProjectsUsers(currentProjectId: any) {
    this.myProjectsService.getUsersByProjectId(currentProjectId).subscribe({
      next: response => {
        this.users = response,
        this.users.forEach(user => {
          user.fullName = user.firstName + ' ' + user.lastName;
          //this.loadPicture(this.users);
          //this.loadPicture(this.users);
        });
      },
      error: error => console.log(error)
    });
  }

  // loadPicture(usersArray: TaskAssignee[]) : void{
  //   usersArray.forEach(user => {
  //     if(user.profilePicUrl!='' && user.profilePicUrl!=null){ //ovde je bilo !=null, a treba ovako
  //     this.uploadservice.getImage(user.profilePicUrl).subscribe(
  //       url=>{
  //         user.pictureUrl=url;
  //       }
  //       )
  //     }
  //   });
  // }
  // loadPicture(usersArray: TaskAssignee[]) : void{
  //   usersArray.forEach(user => {
  //     if(user.profilePicUrl!='' && user.profilePicUrl!=null){ //ovde je bilo !=null, a treba ovako
  //     this.uploadservice.getImage(user.profilePicUrl).subscribe(
  //       url=>{
  //         user.pictureUrl=url;
  //       }
  //       )
  //     }
  //   });
  // }


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
        let rola=this.task?.projectRole;
        this.task = updatedTask;
        this.task.projectRole=rola;


        this.taskUpdated.emit();

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

  ShowEdit(comment_id:number):void{
      const edit=document.getElementById("edit_content"+comment_id) as HTMLElement;
      const save=document.getElementById("save_edit"+comment_id) as HTMLElement;
      const cancel=document.getElementById("cancel_edit"+comment_id) as HTMLElement;
      const content=document.getElementById("comment_content"+comment_id) as HTMLElement;
      content.style.display="none";
      edit.style.display='block';
      save.style.display='block';
      cancel.style.display='block';
  }
  
  editContent(comment_id:number): void {
    
    const edit=document.getElementById("edit_content"+comment_id) as HTMLTextAreaElement;
    
    
    if(edit)
      {
        this.commentsService.updateComment(comment_id, edit.value).subscribe({
          next: () => {
            this.fetchComments();
        },
        error: (error: any) => {
          console.error('Error updating comment:', error);
        }
      });
    }
      
  
  }

  CancelEdit(comment_id:number):void{
    const edit=document.getElementById("edit_content"+comment_id) as HTMLElement;
    const save=document.getElementById("save_edit"+comment_id) as HTMLElement;
    const cancel=document.getElementById("cancel_edit"+comment_id) as HTMLElement;
    const content=document.getElementById("comment_content"+comment_id) as HTMLElement;
    
    content.style.display="block";
    edit.style.display="none";
    save.style.display='none';
    cancel.style.display='none';
    console.log(edit);
  }

  goToProject(project: Project): void {
    this.router.navigate(['/project', project.id]);
  }

  getAllTasks(): void {
    this.myTasksService.GetTasksByUserId(this.userId).subscribe((tasks: ProjectTask[]) => {
      this.myTasksService.GetAllTasksDependencies().subscribe((deps: TaskDependency[]) => {
        // Get the IDs of all tasks that are dependencies of the current task, including indirect dependencies
        const dependentTaskIds = this.getAllDependentTaskIds(this.task?.id, deps);
        
        // Filter out tasks that are dependent on the current task, its dependencies, or itself
        this.tasks = tasks.filter(task => {
          if (dependentTaskIds.includes(task.id) || task.id === this.task?.id) {
            return false; // Exclude tasks that are dependent on the current task or its dependencies, or the task itself
          }
          // Exclude tasks that have their own ID in the dependency chain
          const taskDependencyChain = this.getAllDependentTaskIds(task.id, deps);
          return !taskDependencyChain.includes(task.id);
        });
      });
    });
  }
  
  getAllDependentTaskIds(taskId: any, dependencies: TaskDependency[]): number[] {
    const dependentTaskIds: number[] = [];
  
    // Find dependencies of the current task
    const directDependencies = dependencies.filter(dep => dep.dependencyTaskId === taskId);
    
    // Recursively check dependencies of each dependency
    directDependencies.forEach(dep => {
      dependentTaskIds.push(dep.taskId); // Add direct dependency task ID
      dependentTaskIds.push(...this.getAllDependentTaskIds(dep.taskId, dependencies)); // Recursively find dependencies
    });
  
    return dependentTaskIds;
  }
  
  
  
  getAllTasksDependencies():void{
  }

  addTaskDependency(): void {
    if (!this.task) {
      console.error('Task is null');
      return;
    }
  
    const dtos: TaskDependency[] = [];
    this.deletedTask = false;
  
    this.selectedTasks.forEach(selectedTask => {
      if(this.task)
        {
          const dto: TaskDependency= {
            taskId: this.task.id,
            dependencyTaskId: selectedTask 
        }
        dtos.push(dto);
      };
    });
  
    if (dtos.length === 0) {
      return;
    }
  
    this.myTasksService.addTaskDependencies(dtos).subscribe(
      () => {
        console.log('Task dependencies added successfully');
      },
      (error: any) => {
        console.error('Error adding task dependencies:', error);
      }
    );
  }
  
  deleteTaskDependency(item:ProjectTask): void {

      if (!this.task) {
        console.error('Error: task is null.');
        return;
      }
      this.deletedTask=true;
      const dto: TaskDependency = {
        taskId: this.task.id,
        dependencyTaskId: item.id
      };

      this.myTasksService.deleteTaskDependency(dto).subscribe(
        (response: TaskDependency) => {
          console.log('Task dependency added:', response);
        },
        (error: any) => {
          console.error('Error adding task dependency:', error);
        }
      );
  }

  DisableCloseTask():boolean{
    if(this.task)
      {
        if (Array.isArray(this.task.dependencies))
          {    
            if(this.task.dependencies.length==0)
              {
                return true;
              }
            else
            {
              return false;
            }
          }
      }
      return false;
  }

  downloadFile(fileUrl: any): void {
    this.uploadservice.downloadFile(fileUrl).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        window.open(url, '_blank');
      }
    );
  }

  
  

}  


  

  


