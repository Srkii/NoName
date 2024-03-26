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
  private baseUrl = `${this.apiUrl}/projectTask`; // corrected base URL

  constructor(private http: HttpClient) {}

  GetProjectTasks(): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.baseUrl);
  }

  GetUserTasks(userId: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}`);
  }

  GetProjectTaskById(taskId: number): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.baseUrl}/${taskId}`);
  }
  updateTaskStatus(taskId: number, task: ProjectTask): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(
      `${this.baseUrl}/updateStatus/${taskId}`,
      task
    );
  }
}
