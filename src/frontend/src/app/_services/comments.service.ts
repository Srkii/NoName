import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../Entities/Comments';
import { environment } from '../../environments/environment';
import { ApiUrl } from '../ApiUrl/ApiUrl';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) { }

  postComment(commentDto: any): Observable<Comment> {
    console.log("DATA",commentDto);
    return this.http.post<Comment>(`${this.apiUrl}/postComment`, commentDto);
  }

  getComments(taskId: number): Observable<any> {
    return this.http.get<Comment[]>(`${this.apiUrl}/getComments/${taskId}`);
  }
  deleteComment(commentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteComment/${commentId}`);
  }
  updateComment(commentId: number, content: string): Observable<Comment> {
    // Construct the URL with commentId and content as route parameters
    const url = `${this.apiUrl}/updateComment/${commentId}/${content}`;

    // Make a PUT request to update the comment
    return this.http.put<Comment>(url, null);
  }

}
