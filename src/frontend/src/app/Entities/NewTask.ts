export interface NewTask {
    TaskName: string,
    Description: string,
    StartDate: Date,
    EndDate: Date,
    AppUserId: number,
    ProjectId: number
}
