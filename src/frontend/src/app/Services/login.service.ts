import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { HttpClient } from '@angular/common/http';
import { AppUser } from '../Entities/AppUser';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  private apiUrl = ApiUrl.apiUrl + '/account';

  login(newUser: AppUser) {
    return this.http.post(`${this.apiUrl}/login`, newUser, {
      responseType: 'text',
    });
  }
}
