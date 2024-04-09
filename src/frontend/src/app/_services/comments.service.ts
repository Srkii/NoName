import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comment } from '../Entities/Comments';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = '/api/comments';

  constructor(private http: HttpClient) { }

  postComment(commentDto: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/postComment`, commentDto);
  }

  getComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/getComments/${taskId}`);
  }

  deleteComment(dto: Comment): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteComment`, { body: dto });
  }
}
