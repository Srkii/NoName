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

  GetTasksByProjectId(projectId: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/ByProject/${projectId}`);
  }
}