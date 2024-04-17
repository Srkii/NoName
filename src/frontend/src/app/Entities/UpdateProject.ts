import { Priority, ProjectStatus } from "./Project";

export interface UpdateProject {
    appUserId?: number;
    projectName?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    projectStatus?: ProjectStatus;
    priority?: Priority;
}
