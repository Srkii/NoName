import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { Project } from '../Entities/Project';

@Injectable({
  providedIn: 'root',
})
export class MyProjectsService {
  private apiUrl = ApiUrl.apiUrl;
  private baseUrl = `${this.apiUrl}/projects`; // corrected base URL

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  getUsersProjects(id: any): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/getUsersProjects/${id}`);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }
}

