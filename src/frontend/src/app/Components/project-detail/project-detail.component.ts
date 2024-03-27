import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MyProjectsService } from '../../_services/my-projects.service';
import { Project } from '../../Entities/Project';
import { MyTasksService } from '../../_services/my-tasks.service';
import { ProjectTask, TaskStatus } from '../../Entities/ProjectTask';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | undefined;
  projectTasks: ProjectTask[] = [];
  viewMode: string = 'table';

  constructor(
    private route: ActivatedRoute,
    private myProjectsService: MyProjectsService,
    private myTasksService: MyTasksService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.getProjectInfo();
  }

  getProjectInfo() {
    this.spinner.show();
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.myProjectsService.getProjectById(+projectId).subscribe((project) => {
        this.project = project;
        this.myTasksService.GetTasksByProjectId(project.id).subscribe((tasks) => {
          this.projectTasks = tasks;
        });
        this.spinner.hide();
      });
    }
  }

  getStatusString(status: number): string {
    return TaskStatus[status];
  }
}