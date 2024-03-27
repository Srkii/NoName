import { Component, HostListener, OnInit } from '@angular/core';
import { ProjectTask, TaskStatus } from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';
import { Route, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProjectStatus } from '../../Entities/Project';

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrl: './my-tasks.component.css',
  providers: [DatePipe], // Provide DatePipe here
})
export class MyTasksComponent implements OnInit {
  tasks: ProjectTask[] = [];
  clickedTask: ProjectTask | null = null;
  showPopUp: boolean = false;
  task!: ProjectTask;
  TaskStatus: any;
  previousTaskStatus: TaskStatus | null = null;
  static showPopUp: boolean;

  constructor(
    private myTasksService: MyTasksService,
    private router: Router,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService
  ) {}

  closePopup() {
    this.clickedTask = null; // Set ClickedTask to null when back button is clicked
    this.showPopUp = false; // Close the pop-up
  }

  ngOnInit(): void {
    this.spinner.show();
    this.myTasksService.GetProjectTasks().subscribe((tasks: ProjectTask[]) => {
      this.tasks = tasks;
      this.spinner.hide();
    });
  }
  togglePopUp(task: ProjectTask) {
    const popUp = document.querySelector('.pop') as HTMLElement;
    const popUpTaskName = document.querySelector('.pop h6') as HTMLElement;
    const popUpDueDate = document.querySelector(
      '.pop #popupDueDate'
    ) as HTMLElement;
    const popUpOriginProject = document.querySelector(
      '.pop #popupOriginProject'
    ) as HTMLElement;

    if (popUp && popUpTaskName && popUpDueDate && popUpOriginProject) {
      if (this.clickedTask === task) {
        // If so, reset clickedTask to null and hide the pop-up
        this.clickedTask = null;
      } else {
        this.clickedTask = task;
      }
      if (
        popUp.style.display === 'block' &&
        popUpTaskName.textContent === task.taskName
      ) {
        popUp.style.display = 'none';
    const userId = localStorage.getItem('id'); // Get the user ID from local storage
    if (userId) {
      this.myTasksService
        .GetUserTasks(+userId)
        .subscribe((tasks: ProjectTask[]) => {
          // Convert userId to number
          this.tasks = tasks;
          this.spinner.hide();
          // Set inner HTML of 'Mark complete' button for checked tasks
        });
    } else {
      // Handle case where user ID is not found, e.g., redirect to login
      this.spinner.hide();
    }
  }
  togglePopUp(event: MouseEvent, taskId: number): void {
    event.stopPropagation(); // Prevent event bubbling if necessary

    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'input') {
      // Ignore clicks on input elements
      return;
    }

    // Assuming GetProjectTaskById is a method that fetches the task details
    const row = document.querySelector('.red') as HTMLElement;
    this.myTasksService
      .GetProjectTaskById(taskId)
      .subscribe((task: ProjectTask) => {
        if (
          this.clickedTask &&
          this.clickedTask.id === taskId &&
          this.showPopUp
        ) {
          row.style.backgroundColor = '';
          this.showPopUp = false;
          this.clickedTask = null;
        } else {
          this.clickedTask = task;
          this.showPopUp = true;
        }
      });
  }

  toggleTaskCompletion(event: any, task: ProjectTask): void {
    event.stopPropagation();
    if (event.target.checked) {
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
      },
      (error: any) => {
        // Handle any errors that occur during the update process
        // console.error('Error updating task status:', error);
      }
    );
  }

  handleTaskUpdate(updatedTask: ProjectTask): void {
    // Update the tasks array with the updated task
    // This can be done by finding the task by its ID and updating its status
    const index = this.tasks.findIndex((task) => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      // Optionally, you might want to persist this change to a backend server
    }
  }
  sortOrder: 'asc' | 'desc' = 'asc'; // Variable to track sorting order

  sortTasks() {
    if (this.sortOrder === 'asc') {
      this.tasks.sort((a, b) => {
        const endDateA = new Date(a.endDate).getTime();
        const endDateB = new Date(b.endDate).getTime();
        return endDateA - endDateB;
      });
      this.sortOrder = 'desc'; // Update sorting order
    } else {
      this.tasks.sort((a, b) => {
        const endDateA = new Date(a.endDate).getTime();
        const endDateB = new Date(b.endDate).getTime();
        return endDateB - endDateA;
      });
      this.sortOrder = 'asc'; // Update sorting order
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const popUp = document.querySelector('.pop') as HTMLElement;
    if (popUp && !popUp.contains(event.target as Node) && this.showPopUp) {
      this.showPopUp = false;
      this.clickedTask = null;
    }
  }

  isTasksEmpty(): boolean {
    return this.tasks.length === 0;
  }

  // getStatusString(status: TaskStatus): string {
  //   switch (status) {
  //     case TaskStatus.Proposed:
  //       return 'PROPOSED';
  //     case TaskStatus.InProgress:
  //       return 'IN PROGRESS';
  //     case TaskStatus.Completed:
  //       return 'COMPLETED';
  //     case TaskStatus.Archived:
  //       return 'ARCHIVED';
  //     default:
  //       return '';
  //   }
  // }
}
