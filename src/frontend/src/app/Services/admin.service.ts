import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { Observable } from 'rxjs';

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

  sendInvatation(invData:any):Observable<any>{
    return this.httpClient.post(`${this.apiUrl}/email/send`,invData)
  }

}
