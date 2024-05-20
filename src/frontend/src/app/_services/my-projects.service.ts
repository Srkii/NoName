import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../Entities/Project';
import { Member } from '../Entities/Member';
import { UpdateProject } from '../Entities/UpdateProject';
import { ProjectMember } from '../Entities/ProjectMember';
import { environment } from '../../environments/environment';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { ProjectSection } from '../Entities/ProjectSection';

@Injectable({
  providedIn: 'root',
})
export class MyProjectsService {
  private apiUrl = environment.apiUrl;
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
    searchText:string|null=null,
    projectStatus: string | null = null,
    startDate: string | null = null,
    endDate: string | null = null,
    userId: any = null,
    currentPage: number = 0,
    pageSize: number = 0
  ): Observable<Project[]> {
    let params = new HttpParams();
    if (searchText) {
      params = params.set('searchText', searchText);
    }
    if (projectStatus) {
      params = params.set('projectStatus', projectStatus);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
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
    searchText:string|null=null,
    projectStatus: string | null = null,
    startDate: string | null = null,
    endDate: string | null = null,
    userId: any = null,
    currentPage: number = 0,
    pageSize: number = 0
  ): Observable<number> {
    let params = new HttpParams();
    if (searchText) {
      params = params.set('searchText', searchText);
    }
    if (projectStatus) {
      params = params.set('projectStatus', projectStatus);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
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

  GetAddableUsers(projectCreatorId: number): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}/GetAddableUsers/${projectCreatorId}`);
  }

  UpdateProject(update: UpdateProject): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/updateProject`, update, {responseType: 'json'});
  }

  AddProjectMembers(projectMember: ProjectMember[]):Observable<any>{
    return this.http.put<any>(`${this.baseUrl}/addProjectMembers`, projectMember, {responseType: 'json'})
  }

  DeleteProjectMember(projectId: number,userId: number):Observable<any>{
    return this.http.delete<ProjectMember>(`${this.baseUrl}/DeleteProjectMember/${projectId}/${userId}`)
  }

  UpdateUsersProjectRole(member: ProjectMember):Observable<any>{
    return this.http.post<ProjectMember>(`${this.baseUrl}/UpdateUsersProjectRole`, member, {responseType: 'json'})
  }

  GetProjectSections(projectId:number):Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/ProjectSection/project/${projectId}`);
  }

  GetProjectOwner(projectId:number):Observable<Member>{
    return this.http.get<any>(`${this.baseUrl}/GetProjectOwner/${projectId}`);
  }

  // Add this method to the MyProjectsService class
  archiveProject(projectId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/projects/archive/${projectId}`, {});
  }
}

