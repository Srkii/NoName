import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectSection } from '../Entities/ProjectSection';

@Injectable({
  providedIn: 'root'
})
export class ProjectSectionService {
  private apiUrl = environment.apiUrl + '/ProjectSection';

  constructor(private http: HttpClient) {}

  getSectionsByProject(projectId: number): Observable<ProjectSection[]> {
    return this.http.get<ProjectSection[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createSection(sectionName: string, projectId: number): Observable<ProjectSection> {
    const body = { sectionName, projectId };
    return this.http.post<ProjectSection>(this.apiUrl, body);
  }

  deleteSection(sectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sectionId}`);
  }
}
