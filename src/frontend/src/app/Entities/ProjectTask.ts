// import { Project } from './project';

import { Project } from './Project';

export interface ProjectTask {
  id: number;
  taskName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  taskStatus: TaskStatus;
  projectId: number;
  project: Project;
}

export enum TaskStatus {
  Proposed,
  InProgress,
  Completed,
  Archived,
}
