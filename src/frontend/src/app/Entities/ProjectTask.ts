import { Project } from './Project';
import { TaskDependency } from './TaskDependency';

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
  project: Project;
  projectRole?: string;
  dependencies?:TaskDependency;
  profilePicUrl?: string;
  selected?: boolean;
}