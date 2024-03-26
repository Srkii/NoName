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

  constructor(
    private myTasksService: MyTasksService,
    private router: Router,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService
  ) {}

  closePopUp(): void {
    this.showPopUp = false;
  }
  ngOnInit(): void {
    this.spinner.show();
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
    // Assuming GetProjectTaskById is a method that fetches the task details
    this.myTasksService
      .GetProjectTaskById(taskId)
      .subscribe((task: ProjectTask) => {
        if (
          this.clickedTask &&
          this.clickedTask.id === taskId &&
          this.showPopUp
        ) {
          this.showPopUp = false;
          this.clickedTask = null;
        } else {
          this.clickedTask = task;
          this.showPopUp = true;
        }
      });
  }

  toggleTaskCompletion(task: ProjectTask): void {
    if (task && task.taskStatus) {
      task.taskStatus =
        task.taskStatus === TaskStatus.Completed
          ? TaskStatus.InProgress
          : TaskStatus.Completed;
      // Optionally, update the task status on the server here
      this.updateTaskUI(task);
    }
  }

  updateTaskUI(task: ProjectTask): void {
    // Assuming you have a method to get the button and checkbox elements by task ID
    const markButton = document.querySelector(
      `#markButton-${task.id}`
    ) as HTMLElement;
    const checkBox = document.querySelector(
      `#checkBox-${task.id}`
    ) as HTMLInputElement;

    if (task.taskStatus === TaskStatus.Completed) {
      markButton.innerHTML = 'Completed';
      markButton.style.backgroundColor = 'green';
      checkBox.checked = true;
    } else {
      markButton.innerHTML = 'Mark Complete';
      markButton.style.backgroundColor = ''; // Reset to default
      checkBox.checked = false;
    }
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const popUp = document.querySelector('.pop') as HTMLElement;
    if (popUp && !popUp.contains(event.target as Node) && this.showPopUp) {
      this.showPopUp = false;
    }
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
