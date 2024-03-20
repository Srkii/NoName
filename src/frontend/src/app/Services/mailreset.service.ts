import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { MailReset } from '../Entities/MailReset';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class MailresetService {
  private resetPUrl = ApiUrl.apiUrl;
  
  constructor(private http: HttpClient) { }
  
  sendResetLink(email: MailReset): Observable<any> {
    return this.http.post(`${this.resetPUrl}/email/sendRecovery`, email, {
      responseType: 'json'
    });
  }
}
