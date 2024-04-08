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
    startDateFilter: string | null = null,
    currentPage: number = 0,
    pageSize: number = 0
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
    if (currentPage) {
      params = params.set('currentPage', currentPage.toString());
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize.toString());
    }

    // Make GET request with query parameters
    return this.http.get<Project[]>(this.baseUrl + '/filter', { params: params });
  }

  getUsersProjectsByPage(id: any, currentPage: number = 0, pageSize: number = 0): Observable<Project[]> {
    // Construct query parameters
    let params = new HttpParams();
    params = params.set('currentPage', currentPage.toString());
    params = params.set('pageSize', pageSize.toString());

    // Make GET request with query parameters
    return this.http.get<Project[]>(`${this.baseUrl}/getUsersProjectsByPage/${id}`, { params: params });
  }

  GetUsersProjectsCount(id: any): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/getUsersProjectsCount/${id}`);
  }

}

