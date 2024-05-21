export interface Project {
  id: number;
  projectName: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  projectStatus: ProjectStatus;
  priority: Priority;
  progress: number;
}

export enum ProjectStatus {
  Proposed,
  InProgress,
  Completed,
  Archived,
}

export enum Priority {
  Low,
  Medium,
  High,
}
