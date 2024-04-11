import { Project } from './Project';

export interface ProjectTask {
  id: number;
  taskName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  statusName: string;
  sectionName: string;
  projectId: number;
  firstName?: string;
  lastName?: string;
  project: Project; //cemu ovo sluzi?
}