import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { HttpClient } from '@angular/common/http';
import { AppUser } from '../Entities/AppUser';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  private apiUrl = ApiUrl.apiUrl + '/account';

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
