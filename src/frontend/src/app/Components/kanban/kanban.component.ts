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
  tasksBySection: { [key: string]: ProjectTask[] } = {};
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
    this.GetTaskStatuses();

    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.myTasksService.GetTasksByProjectId(+projectId).subscribe((tasks) => {
        this.tasks = tasks;
        this.groupTasksByStatus();
      });
    }
    
    this.spinner.hide();
  }

  GetTaskStatuses() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.myTasksService.GetTaskStatuses(+projectId).subscribe((statuses) => {
        this.taskStatuses = statuses;
        this.taskStatuses.sort((a, b) => a.position - b.position);
      });
    }
  }
  
  groupTasksByStatus() {
    this.tasksBySection = this.tasks.reduce((acc, task) => {
      const statusName = task.statusName;
      if (!acc[statusName]) {
        acc[statusName] = [];
      }
      acc[statusName].push(task);
      return acc;
    }, {});
    this.taskStatuses.forEach(status => {
      if (!this.tasksBySection[status.name]) {
        this.tasksBySection[status.name] = [];
      }
    });
  }

  drop(event: CdkDragDrop<ProjectTask[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      const task = event.item.data;
      const newStatus = this.taskStatuses.find(s => s.name === event.container.id);
      if (task && newStatus) {
        task.taskStatusId = newStatus.id; // Changed from taskStatus to taskStatusId
        this.myTasksService.updateTaskStatus(task.id, task).subscribe();
      }                        
    }
  }
}