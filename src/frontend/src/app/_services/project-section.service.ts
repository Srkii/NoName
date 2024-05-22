import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectSection } from '../Entities/ProjectSection';

@Injectable({
  providedIn: 'root'
})
export class ProjectSectionService {
  private apiUrl = environment.apiUrl + '/ProjectSection';
  private token: string;
  private httpHeader: HttpHeaders;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('token') || '';
    this.httpHeader=new HttpHeaders({"Authorization": `Bearer ${this.token}`});
  }

  getSectionsByProject(projectId: number): Observable<ProjectSection[]> {
    return this.http.get<ProjectSection[]>(`${this.apiUrl}/project/${projectId}`, {headers:this.httpHeader});
  }

  createSection(sectionName: string, projectId: number): Observable<ProjectSection> {
    const body = { sectionName, projectId };
    return this.http.post<ProjectSection>(this.apiUrl, body, {headers:this.httpHeader});
  }

  deleteSection(sectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sectionId}`, {headers:this.httpHeader});
  }
}
