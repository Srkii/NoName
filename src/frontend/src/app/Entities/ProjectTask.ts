// import { Project } from './project';

import { Project } from './Project';

export interface ProjectTask {
  id: number;
  taskName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  statusName: string;
  projectId: number;
  project: Project;
}