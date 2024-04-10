import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Member } from '../Entities/Member';
import { Project } from '../Entities/Project';
import { CreateProject } from '../Entities/CreateProject';
import { ProjectMember } from '../Entities/ProjectMember';

@Injectable({
  providedIn: 'root'
})
export class ProjectCardService {
  private apiUrl = ApiUrl.apiUrl;
  private projectUrl = `${this.apiUrl}/projects`;
  private userUrl = `${this.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  GetUsers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.userUrl);
  }

  CreateProject(project: CreateProject): Observable<any> {
    return this.http.post<Project>(`${this.projectUrl}/Srdjan`, project, {responseType: 'json'});
  }

  AddProjectMember(projectMember: ProjectMember):Observable<any>{
    return this.http.put<ProjectMember>(`${this.projectUrl}/addProjectMember`, projectMember, {responseType: 'json'})
  }
}
