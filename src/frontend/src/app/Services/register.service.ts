import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { AppUser } from '../Entities/AppUser';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private httpClient:HttpClient) { }
  
  private apiUrl=ApiUrl.apiUrl+'/account';

  register(appUser:AppUser):Observable<any>{
    return this.httpClient.post(`${this.apiUrl}/register`,appUser,{responseType:"text"})
  }
}
