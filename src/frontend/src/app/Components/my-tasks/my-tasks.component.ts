import { Component, OnInit } from '@angular/core';
import { ProjectTask, TaskStatus } from '../../Entities/ProjectTask';
import { MyTasksService } from '../../_services/my-tasks.service';
import { Route, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrl: './my-tasks.component.css',
  providers: [DatePipe], // Provide DatePipe here
})
export class MyTasksComponent implements OnInit {
  tasks: ProjectTask[] = [];
  clickedTask: ProjectTask | null = null;
  class: any;

  constructor(
    private myTasksService: MyTasksService,
    private router: Router,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService
  ) {}

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
        });
    } else {
      // Handle case where user ID is not found, e.g., redirect to login
      this.spinner.hide();
    }
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
      } else {
        popUpTaskName.textContent = task.taskName;
        popUpDueDate.textContent = this.datePipe.transform(
          task.endDate,
          'yyyy-MM-dd HH:mm:ss'
        ); // Convert Date to string
        popUpOriginProject.textContent = task.project
          ? task.project.projectName
          : 'No Project'; // Check if project is not null or undefined
        popUp.style.display = 'block';
      }
      this.setMarkButtonInnerHTML();
    } else {
      this.clickedTask = null;
    }
  }

  markComplete(task: ProjectTask) {
    const mark = document.querySelector('.mark') as HTMLElement;

    if (task.taskStatus === TaskStatus.Completed) {
      mark.innerHTML = 'Mark complete'; // Set the innerHTML to 'Mark complete'
    } else {
      task.taskStatus = TaskStatus.Completed;
      // You may also want to update the task status on the server here

      // Since the task is completed now, update the innerHTML to 'Completed'
      mark.innerHTML = 'Completed';
    }
  }

  isTaskCompleted(task: ProjectTask): boolean {
    return task.taskStatus === TaskStatus.Completed;
  }

  isChecked(): boolean {
    const checkbox = document.querySelector('.check') as HTMLInputElement;
    return checkbox.checked;
  }

  setMarkButtonInnerHTML(): void {
    const mark = document.querySelector('.mark') as HTMLElement;
    if (this.isChecked()) {
      mark.innerHTML = 'Completed';
    } else {
      mark.innerHTML = 'Mark complete';
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
