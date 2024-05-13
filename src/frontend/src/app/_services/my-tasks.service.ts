import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { ProjectTask } from '../Entities/ProjectTask';
import { ChangeTaskInfo } from '../Entities/ChangeTaskInfo';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { TaskDependency } from '../Entities/TaskDependency';
import { DateTimeDto } from '../Entities/DateTimeDto';
import { Project } from '../Entities/Project';

@Injectable({
  providedIn: 'root',
})
export class MyTasksService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/projectTask`;
  sectionDeleted = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  GetProjectTasks(): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.baseUrl);
  }

  GetTasksByProjectId(projectId: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(
      `${this.baseUrl}/ByProject/${projectId}`
    );
  }

  GetTasksByUserId(userId: any): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}`);
  }

  GetProjectTask(taskId: number, userId: any): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.baseUrl}/${taskId}/${userId}`);
  }
  //tico: mirkov updateTaskStatus. Treba da se promeni
  updateTaskStatus1(id: number, statusName: string): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.baseUrl}/updateStatus/${id}/${statusName}`, null);
  }

  // kada pomeram taskove iz archived saljem listu zbog boljih performansi
  UpdateArchTasksToCompleted(taskIds: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateArchTasksToCompleted`, taskIds);
  }

  updateTicoTaskStatus(taskId: number, task: ProjectTask): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.baseUrl}/updateTicoStatus/${taskId}`,task );
  }

  //tico kanban ; ne diraj!
  GetTaskStatuses(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/statuses/${projectId}`);
  }
  // za kanban
  updateTaskStatusPositions(updatedStatuses: any[]): Observable<any> {
  return this.http.put(`${this.baseUrl}/updateStatusPositions`, updatedStatuses);
  }
  sortTasksByDueDate(userId:any,sortOrder: string): Observable<ProjectTask[]> {
    const url = `${this.baseUrl}/sortTasksByDueDate/${userId}?sortOrder=${sortOrder}`;
    return this.http.get<ProjectTask[]>(url);
  }
  // za addNewSection modal
  addTaskStatus(taskStatus: { statusName: string; projectId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/addTaskStatus`, taskStatus);
  }
  // za addNewTask modal
  createTask(task: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, task);
  }
  // za deleteSection modal
  deleteTaskStatus(taskStatusId: number | null): Observable<any> {
    if (taskStatusId === null) {
      throw new Error('Task status ID is null');
    }
    return this.http.delete(`${this.baseUrl}/deleteTaskStatus/${taskStatusId}`);
  }

  GetNewTasksByUserId(userId: any, count: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}/count1/${count}`);
  }
  GetSoonTasksByUserId(userId: any, count: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}/count2/${count}`);
  }
  GetClosedTasksByUserId(userId: any, count: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}/count3/${count}`);
  }
  changeTaskInfo(dto: ChangeTaskInfo): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.baseUrl}/changeTaskInfo`, dto);
  }

  addTaskDependencies(dtos: TaskDependency[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/addTaskDependency`, dtos);
  }

  deleteTaskDependency(dto: TaskDependency): Observable<any> {
    return this.http.post(`${this.baseUrl}/deleteTaskDependency`, dto);
  }
  GetAllTasksDependencies():Observable<TaskDependency[]>{
    return this.http.get<TaskDependency[]>(`${this.baseUrl}/getAllTasksDependencies`);
  }

  deleteTask(taskId: number): Observable<any> {
    const url = `${this.baseUrl}/deleteTask/${taskId}`;
    return this.http.delete(url);
  }
  GetTaskDependencies(id:any):Observable<TaskDependency[]>{
    return this.http.get<TaskDependency[]>(`${this.baseUrl}/getTaskDependencies/${id}`);
  }
  UpdateTimeGantt(id:any,startDate:Date,endDate:Date){
    var newDatetime:DateTimeDto = {
      StartDate:startDate,
      EndDate:endDate,
    }
    return this.http.post<any>(`${this.baseUrl}/timeUpdateGantt/${id}`,newDatetime);
  }

  TaskNameExists(taskName: string): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.baseUrl}/getTaskByName/${taskName}`);
  }


}
