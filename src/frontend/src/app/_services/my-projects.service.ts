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
  filterAndPaginateProjects(
    projectName: string | null = null,
    projectStatus: string | null = null,
    projectPriority: string | null = null,
    endDateFilter: string | null = null,
    startDateFilter: string | null = null,
    userId: any = null,
    currentPage: number = 0,
    pageSize: number = 0
  ): Observable<Project[]> {
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
    if (userId) {
      params = params.set('userId', userId);
    }
    if (currentPage) {
      params = params.set('currentPage', currentPage.toString());
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize.toString());
    }

    return this.http.get<Project[]>(`${this.baseUrl}/filterAndPaginate`, { params: params });
  }
  CountFilteredProjects(
    projectName: string | null = null,
    projectStatus: string | null = null,
    projectPriority: string | null = null,
    endDateFilter: string | null = null,
    startDateFilter: string | null = null,
    userId: any = null,
    currentPage: number = 0,
    pageSize: number = 0
  ): Observable<number> {
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
    if (userId) {
      params = params.set('userId', userId);
    }
    if (currentPage) {
      params = params.set('currentPage', currentPage.toString());
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize.toString());
    }

    return this.http.get<number>(`${this.baseUrl}/countFiltered`, { params: params });
  }

  GetUsersProjectsCount(id: any): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/getUsersProjectsCount/${id}`);
  }

  // vraca korisnike koji su na datom projektu
  getUsersByProjectId(projectId: number): Observable<any> {
    if(projectId === null) 
      throw new Error('ProjetId is null.');
    return this.http.get(`${this.baseUrl}/GetUsersByProjectId/${projectId}`)
  }
}

