import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { AppUser } from '../Entities/AppUser';
import { Invintation } from '../Entities/Invitation';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private httpClient: HttpClient) {}

  private apiUrl = ApiUrl.apiUrl;

  register(appUser: AppUser): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/account/register`, appUser, {
      responseType: 'text',
    });
  }
  getEmailByToken(token: string): Observable<Invintation> {
    return this.httpClient.get<Invintation>(
      `${this.apiUrl}/users/token/${token}`
    );
  }
}
