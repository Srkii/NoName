import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { Observable } from 'rxjs';
import { Invintation } from '../Entities/Invitation';
import { Invatation } from '../Entities/RegisterInvitation';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpClient:HttpClient) { }

  private apiUrl=ApiUrl.apiUrl;

  check():boolean{
    const role=localStorage.getItem('role')

    if(role==='0')
      return true;
    else return false
  }

  sendInvatation(invData: Invatation): Observable<any>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.httpClient.post<any>(`${this.apiUrl}/email/sendInvitation`,invData,httpOptions)
  }

}
