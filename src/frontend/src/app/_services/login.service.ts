import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppUser } from '../Entities/AppUser';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl + '/account';

  login(newUser: AppUser): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, newUser, {
      responseType: 'json',
    });
  }

  checkToken():boolean{
    let token=localStorage.getItem('token');
    let exist=!!token;
    return exist;
  }
}
