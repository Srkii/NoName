import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  filterProjects(
    projectName: string | null = null,
    projectStatus: string | null = null,
    projectPriority: string | null = null,
    endDateFilter: string | null = null,
    startDateFilter: string | null = null
  ): Observable<Project[]> {
    // Construct query parameters
    let params = new HttpParams();
    if (projectName) {
      params = params.set('projectName', projectName);
    }
    if (projectStatus) {
      params = params.set('projectStatus', projectStatus);
    }
    if (projectPriority) {
      params = params.set('projectPriority', projectPriority);
    }
    if (endDateFilter) {
      params = params.set('endDateFilter', endDateFilter);
    }
    if (startDateFilter) {
      params = params.set('startDateFilter', startDateFilter);
    }

    // Make GET request with query parameters
    return this.http.get<Project[]>(this.baseUrl + '/filter', { params: params });
  }
}

