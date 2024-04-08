import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { HttpClient } from '@angular/common/http';
import { ProjectTask } from '../Entities/ProjectTask';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MyTasksService {
  private apiUrl = ApiUrl.apiUrl;
  private baseUrl = `${this.apiUrl}/projectTask`;

  constructor(private http: HttpClient) {}

  GetProjectTasks(): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.baseUrl);
  }

  GetTasksByProjectId(projectId: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(
      `${this.baseUrl}/ByProject/${projectId}`
    );
  }

  GetUserTasks(userId: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}`);
  }

  GetProjectTaskById(taskId: number): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.baseUrl}/${taskId}`);
  }
  //tico: mirkov updateTaskStatus. Treba da se promeni
  updateTaskStatus(taskId: number, statusName: string): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.baseUrl}/updateStatus/${taskId}/${statusName}`, null);
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
  //tico: duplikat GetUserTasks... Ispraviti gde se koristi
  GetTasksByUserId(userId: any): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}`);
  }
  // za addNewSection modal
  addTaskStatus(taskStatus: { statusName: string; projectId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/addTaskStatus`, taskStatus);
  }
  // za addNewTask modal
  createTask(task: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, task);
  }
}
