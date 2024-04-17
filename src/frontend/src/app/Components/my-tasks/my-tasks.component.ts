import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ProjectTask } from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from '../../_services/shared.service';
import { trigger, transition, style, animate } from '@angular/animations';

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
    private cdr: ChangeDetectorRef
  ) {}

  closePopup() {
    this.clickedTask = null; 
    this.showPopUp = false; 
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  togglePopUp(event: MouseEvent, taskId: number): void {
    event.stopPropagation(); 
    const row = document.querySelector('.td_row') as HTMLElement;
    this.myTasksService
      .GetProjectTask(taskId,this.userId)
      .subscribe((task: ProjectTask) => {
        if (
          this.clickedTask &&
          this.clickedTask.id === taskId &&
          this.showPopUp
        ) {
          row.style.backgroundColor = '';
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
        console.log(this.new_tasks[0]);
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
    const now = new Date().getTime(); // Convert to timestamp
    const endDateTimestamp = new Date(endDate).getTime(); // Convert to timestamp
    return endDateTimestamp <= now; // Check if endDate is less than now
  }
  
}
