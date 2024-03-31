import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { MyProjectsService } from '../../_services/my-projects.service';
import { MyTasksService } from '../../_services/my-tasks.service';
import { Project } from '../../Entities/Project';
import { ProjectTask } from '../../Entities/ProjectTask';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css'
})
export class KanbanComponent implements OnInit{
  tasks: any[] = [];
  taskStatuses: any[] = [];
  // tasksBySection: { [key: string]: ProjectTask[] } = {};
  project: Project | undefined;
  // projectTasks: ProjectTask[] = [];
  taskStatusNames: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private myProjectsService: MyProjectsService,
    private myTasksService: MyTasksService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.taskStatusNames = this.taskStatuses.map(s => s.name);
    // this.taskStatusNames.forEach(status => {
    //   this.tasksBySection[status] = [];
    // });
    // this.GetTaskStatuses();
    // this.getProjectTasks();
    this.spinner.hide();
  }
  
  // getProjectTasks() {
  //   const projectId = this.route.snapshot.paramMap.get('id');
  //   if (projectId) {
  //     this.myProjectsService.getProjectById(+projectId).subscribe((project) => {
  //       this.project = project;
  //       this.myTasksService.GetTasksByProjectId(project.id).subscribe((tasks) => {
  //         this.projectTasks = tasks;
  //         console.log(tasks)
  //       });
  //     });
  //   }
  // }

  // tico ispravi
  // getProjectTasks() {
  //   const projectId = this.route.snapshot.paramMap.get('id');
  //   if (projectId) {
  //     this.myProjectsService.getProjectById(+projectId).subscribe((project) => {
  //       this.project = project;
  //       this.myTasksService.GetTasksByProjectId(project.id).subscribe((tasks) => {
  //         this.projectTasks = tasks;
  //         const newTasksBySection = this.projectTasks.reduce((acc: { [key: string]: ProjectTask[] }, task: ProjectTask) => {
  //           const statusName = this.getStatusString(task.taskStatus);
  //           if (!acc[statusName]) {
  //             acc[statusName] = [];
  //           }
  //           acc[statusName].push(task);
  //           return acc;
  //         }, {});
  //         this.tasksBySection = { ...this.tasksBySection, ...newTasksBySection };
  //       });
  //     });
  //   }
  // }
  getStatusString(status: number): string {
    return this.taskStatuses.find(s => s.id === status)?.name || 'Unknown';
  }
  // GetTaskStatuses() {
  //   this.myTasksService.GetTaskStatuses().subscribe((statuses) => {
  //     this.taskStatuses = statuses;
  //     this.taskStatuses.forEach(status => {
  //       this.tasksBySection[status.name] = [];
  //     });
  //     // this.getProjectTasks();
  //   });
//   }
//   drop(event: CdkDragDrop<ProjectTask[]>) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       transferArrayItem(event.previousContainer.data,
//                         event.container.data,
//                         event.previousIndex,
//                         event.currentIndex);
//       const task = event.item.data;
//       const newStatus = this.taskStatuses.find(s => s.name === event.container.id);
//       if (task && newStatus) {
//         task.taskStatusId = newStatus.id; // Changed from taskStatus to taskStatusId
//         this.myTasksService.updateTaskStatus(task.id, task).subscribe();
//       }                        
//     }
//   }
}