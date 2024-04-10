import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../Entities/Comments'; 
import { ApiUrl } from '../ApiUrl/ApiUrl';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = `${ApiUrl.apiUrl}/comments`;

  constructor(private http: HttpClient) { }

  postComment(commentDto: any): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/postComment`, commentDto);
  }

  getComments(taskId: number): Observable<any> {
    return this.http.get<Comment[]>(`${this.apiUrl}/getComments/${taskId}`);
  }

  deleteComment(dto: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteComment`, { body: dto });
  }
}
