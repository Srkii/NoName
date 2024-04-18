import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MailReset } from '../Entities/MailReset';
import { Observable } from 'rxjs/internal/Observable';
import { ResetRequest } from '../Entities/ResetRequest';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MailresetService {
  private resetPUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }
  
  sendResetLink(email: MailReset): Observable<any> {
    return this.http.post(`${this.resetPUrl}/email/sendRecovery`, email, {
      responseType: 'json'
    });
  }

  getEmailByToken(token: string): Observable<ResetRequest> {
    return this.http.get<ResetRequest>(
      `${this.resetPUrl}/account/token/${token}`
    );
  }

  resetPassword(resetRequest: ResetRequest): Observable<any> {
    return this.http.post(`${this.resetPUrl}/account/resetPassword`, resetRequest, {
      responseType: 'json',
    });
  }
}
