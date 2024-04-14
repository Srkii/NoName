import { Priority, ProjectStatus } from "./Project";

export interface CreateProject {
    ProjectName: string;
    Description?: string;
    StartDate?: Date;
    EndDate?: Date;
    ProjectStatus?: ProjectStatus;
    Priority: Priority;
    AppUserId?: Int16Array;
}