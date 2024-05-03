import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ProjectTask } from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';
import { NavigationExtras, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from '../../_services/shared.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Project } from '../../Entities/Project';

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css'],
  providers: [DatePipe], 
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

export class MyTasksComponent implements OnInit {
  [x: string]: any;
  new_tasks: ProjectTask[] = [];
  soon_tasks: ProjectTask[] = [];
  closed_tasks: ProjectTask[] = [];
  clickedTask: ProjectTask | null = null;
  showPopUp: boolean = false;
  task!: ProjectTask;
  TaskStatus: any;
  static showPopUp: boolean;
  userId=localStorage.getItem('id');


  constructor(
    private myTasksService: MyTasksService,
    private spinner: NgxSpinnerService,
    private shared: SharedService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private sharedService:SharedService
  ) {}

  closePopup() {
    this.clickedTask = null; 
    this.showPopUp = false; 
  }

  ngOnInit(): void {
    this.sharedService.taskUpdated.subscribe(() => {
      this.loadTasks();  
    });
    this.loadTasks();

  }

  togglePopUp(event: MouseEvent, taskId: number): void {
    event.stopPropagation(); 
    this.myTasksService
      .GetProjectTask(taskId,this.userId)
      .subscribe((task: ProjectTask) => {
        if (
          this.clickedTask &&
          this.clickedTask.id === taskId &&
          this.showPopUp
        ) {
          this.showPopUp = false;
          this.clickedTask = null;
          this.shared.current_task_id = null;
        } else {
          this.clickedTask = task;
          this.showPopUp = true;
          this.shared.current_task_id = this.clickedTask.id;
        }
      });
  }


  loadTasks(): void {
    this.spinner.show();

    if (this.userId !== null) {
    this.myTasksService
      .GetNewTasksByUserId(this.userId,5)
      .subscribe((tasks: ProjectTask[]) => {
        this.new_tasks = tasks;
        this.spinner.hide();
      });
    this.myTasksService
      .GetSoonTasksByUserId(this.userId,5)
      .subscribe((tasks: ProjectTask[]) => {
        this.soon_tasks = tasks;
        this.spinner.hide();
      });
    this.myTasksService
      .GetClosedTasksByUserId(this.userId,5)
      .subscribe((tasks: ProjectTask[]) => {
        this.closed_tasks = tasks;
        this.spinner.hide();
      });
    } else {
      console.error('User ID is null');
      this.spinner.hide();
    }
    this.cdr.detectChanges();
  }

  
  
  sortOrder: 'asc' | 'desc' = 'asc';

  sortTasks() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; 

    this.spinner.show();
    this.myTasksService.sortTasksByDueDate(this.userId,this.sortOrder)
      .subscribe({
        next: (sortedTasks: ProjectTask[]) => {
          this.closed_tasks = sortedTasks;
          this.spinner.hide();
        },
        error: (error: any) => {
          console.error('Error sorting tasks:', error);
          this.spinner.hide();
        }
      });
}


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const popUp = document.querySelector('.pop') as HTMLElement;
    if (popUp && !popUp.contains(event.target as Node) && this.showPopUp) {
      this.showPopUp = false;
      this.clickedTask = null;
    }
  }

  isNewTasksEmpty(): boolean {
    return this.new_tasks.length === 0;
  }
  isSoonTasksEmpty(): boolean {
    return this.soon_tasks.length === 0;
  }
  isClosedTasksEmpty(): boolean {
    return this.closed_tasks.length === 0;
  }

  LoadNewTasks(event:Event):void{
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.spinner.show();

    if (this.userId !== null) {
    this.myTasksService
      .GetNewTasksByUserId(this.userId,parseInt(selectedValue))
      .subscribe((tasks: ProjectTask[]) => {
        this.new_tasks = tasks;
        this.spinner.hide();
      });
    }
  }
  LoadSoonTasks(event:Event):void{
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.spinner.show();

    if (this.userId !== null) {
      this.myTasksService
      .GetSoonTasksByUserId(this.userId,parseInt(selectedValue))
      .subscribe((tasks: ProjectTask[]) => {
        this.soon_tasks = tasks;
        this.spinner.hide();
      });
    }
  }
  LoadClosedTasks(event:Event):void{
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.spinner.show();

    if (this.userId !== null) {
      this.myTasksService
      .GetClosedTasksByUserId(this.userId,parseInt(selectedValue))
      .subscribe((tasks: ProjectTask[]) => {
        this.closed_tasks = tasks;
        this.spinner.hide();
      });
    }
  }

  isOverdue(endDate: Date): boolean {
    const now = new Date().getTime(); 
    const endDateTimestamp = new Date(endDate).getTime(); 
    return endDateTimestamp <= now; 
  }

  
  goToProject(project: Project): void {
    this.router.navigate(['/project', project.id]);
  }

  sortTasksByName(tasks: ProjectTask[]) {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; 
  
    tasks.sort((a, b) => {
      const nameA = a.taskName.toLowerCase();
      const nameB = b.taskName.toLowerCase();
  
      if (nameA < nameB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  sortTasksByProjectName(tasks: ProjectTask[]) {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; 
  
    tasks.sort((a, b) => {
      const nameA = a.project.projectName.toLowerCase();
      const nameB = b.project.projectName.toLowerCase();
  
      if (nameA < nameB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  sortTasksBySectionName(tasks: ProjectTask[]) {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; 
  
    tasks.sort((a, b) => {
      const nameA = a.sectionName.toLowerCase();
      const nameB = b.sectionName.toLowerCase();
  
      if (nameA < nameB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  sortTasksByDueDate(tasks: ProjectTask[]) {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'; 
  
    tasks.sort((a, b) => {
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
  
      if (dateA < dateB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (dateA > dateB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  //~maksim
  openTaskPopup(taskId: number): void {
    this.myTasksService.GetProjectTask(taskId, this.userId)
      .subscribe((task: ProjectTask) => {
        this.clickedTask = task;
        this.showPopUp = true;
      });
  }
  
}
