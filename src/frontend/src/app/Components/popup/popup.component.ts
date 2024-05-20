import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectorRef, SimpleChanges, TemplateRef } from '@angular/core';
import { ProjectTask } from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';
import { UserinfoService } from '../../_services/userinfo.service';
import { CommentsService } from '../../_services/comments.service'; 
import { Comment } from '../../Entities/Comments'; 
import { MyProjectsService } from '../../_services/my-projects.service';
import { TaskAssignee } from '../../Entities/TaskAssignee';
import { Project } from '../../Entities/Project';
import { UploadService } from '../../_services/upload.service';
import { ChangeTaskInfo } from '../../Entities/ChangeTaskInfo';
import { Router } from '@angular/router';
import { TaskDependency } from '../../Entities/TaskDependency';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '../../_services/shared.service';
import { ProjectSection } from '../../Entities/ProjectSection';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('commentInput') commentInput!: ElementRef;
  @ViewChild('containerDiv') containerDiv!: ElementRef;
  @ViewChild('fixedArea') fixedArea!: ElementRef;
  @ViewChild('commentDiv') commentDiv!: ElementRef;
  @Input() task: ProjectTask | null = null;
  @Output() taskUpdated: EventEmitter<ProjectTask> = new EventEmitter<ProjectTask>();
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
  allDependencies:TaskDependency[]=[];
  modalRef?: BsModalRef;
  sections:ProjectSection[]=[];
  selectedSection: ProjectSection | undefined;
  current_user: any;
  
    
  attachment_name:string = '';
  attachment_added:boolean = false;
  file:any;


  constructor(private myTasksService: MyTasksService,
              private cdr: ChangeDetectorRef,
              private userInfo:UserinfoService,  
              private commentsService: CommentsService,
              private myProjectsService: MyProjectsService,    
              public uploadservice: UploadService, 
              private router: Router,
              private modalService: BsModalService,
              private sharedService:SharedService,
              private uploadService:UploadService
            ){}

  ngOnChanges(changes: SimpleChanges): void {
    if ('task' in changes && this.task) {
      
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
      this.selectedSection=this.task.projectSection;
      this.getUser();
      this.fetchComments();
      this.getProjectsUsers(this.task.projectId);
      this.getAllTasks();
      this.getProjectSections();
      
    }
  }

  ngAfterViewInit() {
    this.adjustCommentHeight();
  }

  adjustCommentHeight() {
    if(this.task?.projectRole!='4')
    {
      const containerHeight = this.containerDiv.nativeElement.offsetHeight;
      const fixedHeight = this.fixedArea.nativeElement.offsetHeight;
      const commentHeight = containerHeight - (fixedHeight+60);
      this.commentDiv.nativeElement.style.height = `${commentHeight}px`;
    }
  }


  fetchComments(): void {
    if (this.task && this.task.id) {
      this.commentsService.getComments(this.task.id).subscribe({
        next: (comments: Comment[]) => {
          this.comments = comments;
          console.log(comments);
        },
        error: (error: any) => {
          console.error('Error fetching comments:', error);
        }
      });
    }
  }


  closeTask(task: ProjectTask): void {
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
        this.sharedService.emitTaskUpdated();
        
      },
      error: (error: any) => {
        console.error('Error toggling task completion:', error);
      }
    });
  }

  toggleTaskCompletion(task: ProjectTask): void {
    var previousTaskStatus = "";
    if (task.statusName == 'InReview') {
      previousTaskStatus = task.statusName;
      task.statusName = 'Completed';
    } else {
      if(previousTaskStatus!="")
        task.statusName = previousTaskStatus;
      else
        task.statusName = 'InReview';
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
        this.sharedService.emitTaskUpdated();
        
      },
      error: (error: any) => {
        console.error('Error toggling task completion:', error);
      }
    });
  }
  ArchiveTasks(task: ProjectTask): void {
    var previousTaskStatus = "";
    if (task.statusName != 'Archived') {
      previousTaskStatus = task.statusName;
      task.statusName = 'Archived';
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
        this.sharedService.emitTaskUpdated();
        
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
    if(this.task?.projectRole!='4')
    {
      const trash = document.querySelector('.trash') as HTMLElement;
    }
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
      pop.style.width = "calc(100% - 22px)";
      pop.style.padding = '15px';
      // back.style.marginRight = '1%';
      // exit_full.style.marginRight = '30px';
      // trash.style.marginRight = '30px';
      exit_full.style.display = 'flex';
      full.style.display = 'none';
      // file.style.marginRight = '3%';
      // comments.style.marginTop = '0%';
      comments.style.width = '100%';
      this.fullscreen = !this.fullscreen;
    } else {
      pop.style.top="";
      pop.style.height="";
      pop.style.width = '';
      pop.style.padding = '';
      back.style.marginRight = '';
      exit_full.style.marginRight = '';
      // trash.style.marginRight = '';
      exit_full.style.display = 'none';
      full.style.display = '';
      comments.style.marginTop = '';
      comments.style.marginTop = '';
      this.fullscreen = !this.fullscreen;
    }
  }
  getUser(): void{
    var id=this.task?.appUser?.id;
    this.userInfo.getUserInfo2(id).subscribe({
      next:(response)=>{
        this.user=response;
        this.user.fullName = this.user.firstName + ' ' + this.user.lastName;
        this.selectedUser=this.user;
        if (this.selectedUser) {
          this.selectedUser.appUserId = this.user.id;
          this.selectedUser.lastName = this.user.lastName;
          this.selectedUser.firstName = this.user.firstName;
          this.selectedUser.profilePicUrl = this.user.profilePicUrl;
        }
      },error:(error)=>{
        console.log(error)
      }

    })
  }

  addComment(): void {
    const content = this.commentInput.nativeElement.value.trim();
    var id=localStorage.getItem("id");
    this.userInfo.getUserInfo2(id).subscribe({
      next:(response)=>{
        this.current_user=response;
        console.log(this.task?.id);
        console.log(this.current_user.id);
        console.log(this.current_user.firstName);
        console.log(this.current_user.lastName);
        console.log(content);
        console.log(new Date);
        if (content || this.attachment_added) {
          const commentDto: Comment = {
            id: -1,
            taskId: this.task!.id,
            content: content,
            senderId: this.current_user.id,
            senderFirstName: this.current_user.firstName,
            senderLastName: this.current_user.lastName,
            messageSent:  new Date,
            fileUrl: this.attachment_name?this.attachment_name:"",
            edited:false,
          };
          console.log("COMM ",commentDto);
          this.commentsService.postComment(commentDto).subscribe({
            next: (comment: Comment) => {
              commentDto.id = comment.id;
              this.comments.push(commentDto);
              this.commentInput.nativeElement.value = '';
              
              if(this.attachment_name!="")this.uploadAttachment();
    
            setTimeout(() => {
              this.scrollToBottom();
            });
    
            },
            error: (error: any) => {
              console.error('Error adding comment:', error);
            }
          });
        }
      },error:(error)=>{
        console.log(error)
      }

    })

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
        });
      },
      error: error => console.log(error)
    });
  }


  updateTaskInfo(task: ProjectTask): void {
    const dto: ChangeTaskInfo = {
      id: task.id,
      taskName: task.taskName,
      description: task.description,
      projectId: this.selectedProject.id,
      appUserId: this.selectedUser?.appUserId,
      dueDate: task.endDate,
      sectionId: this.selectedSection ? this.selectedSection.id : 0
    };

    this.myTasksService.changeTaskInfo(dto).subscribe({
      next: (updatedTask: ProjectTask) => {
        let rola=this.task?.projectRole;
        this.task = updatedTask;
        this.task.projectRole=rola;


        this.sharedService.emitTaskUpdated();
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
    const original_content=this.comments.find(comment => comment.id === comment_id)?.content;

    
    
    if(edit.value!=original_content)
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
    else
    {
      this.CancelEdit(comment_id);
    }
      
  
  }

  CancelEdit(comment_id:number):void{
    const edit=document.getElementById("edit_content"+comment_id) as HTMLElement;
    const edit1=document.getElementById("edit_content"+comment_id) as HTMLTextAreaElement;
    const save=document.getElementById("save_edit"+comment_id) as HTMLElement;
    const cancel=document.getElementById("cancel_edit"+comment_id) as HTMLElement;
    const content=document.getElementById("comment_content"+comment_id) as HTMLElement;
    const original_content=this.comments.find(comment => comment.id === comment_id)?.content;

    if(original_content!=undefined)
      edit1.value=original_content; 

    content.style.display="block";
    edit.style.display="none";
    save.style.display='none';
    cancel.style.display='none';
  }

  goToProject(project: Project): void {
    this.router.navigate(['/project', project.id]);
  }

  getAllTasks(): void {
    if(this.task)
    this.myTasksService.GetTasksByProjectId(this.task?.projectId).subscribe((tasks: ProjectTask[]) => {
      this.myTasksService.GetAllTasksDependencies().subscribe((deps: TaskDependency[]) => {
        const dependentTaskIds = this.getAllDependentTaskIds(this.task?.id, deps);
        
        this.tasks = tasks.filter(task => {
          if (dependentTaskIds.includes(task.id) || task.id === this.task?.id) {
            return false; 
          }
          const taskDependencyChain = this.getAllDependentTaskIds(task.id, deps);
          return !taskDependencyChain.includes(task.id);
        });
      });
    });
  }
  
  getAllDependentTaskIds(taskId: any, dependencies: TaskDependency[]): number[] {
    const dependentTaskIds: number[] = [];
  
    const directDependencies = dependencies.filter(dep => dep.dependencyTaskId === taskId);
    
    directDependencies.forEach(dep => {
      dependentTaskIds.push(dep.taskId); 
      dependentTaskIds.push(...this.getAllDependentTaskIds(dep.taskId, dependencies)); 
    });
  
    return dependentTaskIds;
  }
  
  
  
  
  addTaskDependency(): void {
    if (!this.task) {
      console.error('Task is null');
      return;
    }
  
    const dtos: TaskDependency[] = [];
  
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
    this.sharedService.emitTaskUpdated();
  }
  
  deleteTaskDependency(item:ProjectTask): void {

      if (!this.task) {
        console.error('Error: task is null.');
        return;
      }
      const dto: TaskDependency = {
        taskId: this.task.id,
        dependencyTaskId: item.id
      };
      


      this.myTasksService.deleteTaskDependency(dto).subscribe(
        (response: TaskDependency) => {
          console.log('Task dependency deleted:');
        },
        (error: any) => {
          console.error('Error adding task dependency:', error);
        }
      );
      this.sharedService.emitTaskUpdated();
  }

  DisableCloseTask():boolean{
    if (Array.isArray(this.selectedTasks))
      {    
          if(this.selectedTasks.length==0)
            {
              return true;
            }
          else
          {
            return false;
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

  openDeleteModal(modal: TemplateRef<void>){
    this.modalRef = this.modalService.show(
      modal,
      {
        class: 'modal-sm modal-dialog-centered'
      });
    
  }

  closeDeleteModal() {
    if(this.modalRef)
      {
        this.modalRef.hide();
      }
  }

  deleteTask(taskId: number): void {

    this.myTasksService.deleteTask(taskId).subscribe({
      next: (response) => {
        console.log('Task deleted successfully:', response);
        if(this.task)
          this.sharedService.emitTaskUpdated();
        this.backClicked.emit();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      }
    });
  }
  getProjectSections(): void {
    if (this.task) {
      this.myProjectsService.GetProjectSections(this.task.projectId).subscribe({
        next: (sections: ProjectSection[]) => {
          this.sections = sections;

        },
        error: (error: any) => {
          console.error('Error fetching project sections:', error);
        }
      });
    }
  }

  hide_comment_area():boolean{
    if(this.task?.projectRole=='4')
      {
        return true;
      }
      else
      {
        return false;
      }
    
  }

  
  
  //emigrirao sam ovde ~maksim

  fileInputHandler($event:any){
    this.file= $event.target.files[0];

    if(this.file!=null && this.sharedService.current_task_id!=null)
    {
      this.attachment_name = this.file.name;
      this.attachment_added = true;
      console.log("file ready for upload");
    }
    else{
      console.log("no file data");
    }
  }
  uploadAttachment(){
    var task_id = Number(this.sharedService.current_task_id);
    var token = localStorage.getItem('token');
    var user_id = localStorage.getItem('id');//prosledim id posiljaoce
    this.uploadService.UploadFile(task_id,user_id,this.file,token).subscribe({
      next: (response) =>{
        //vise ne treba ovo da radi
        // console.log(response); 
        // this.comments.push(response);
        this.attachment_name = ""
        this.attachment_added = false;
      },
      error:(error) =>{
        console.log(error);
      }
    }); 
  }

}




  

  


