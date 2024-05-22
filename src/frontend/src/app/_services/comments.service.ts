import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../Entities/Comments';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = `${environment.apiUrl}/comments`;
  private token: string;
  private httpHeader: HttpHeaders;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('token') || '';
    this.httpHeader=new HttpHeaders({"Authorization": `Bearer ${this.token}`});
  }

  postComment(commentDto: any): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/postComment`, commentDto, {headers:this.httpHeader});
  }

  getComments(taskId: number): Observable<any> {
    return this.http.get<Comment[]>(`${this.apiUrl}/getComments/${taskId}`, {headers:this.httpHeader});
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteComment/${commentId}`, {headers:this.httpHeader});
  }
  
  updateComment(commentId: number, content: string): Observable<Comment> {
    const url = `${this.apiUrl}/updateComment/${commentId}/${content}`;
    return this.http.put<Comment>(url, null, {headers:this.httpHeader});
  }

}
