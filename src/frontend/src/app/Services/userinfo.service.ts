import { ApiUrl } from './../ApiUrl/ApiUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUser } from '../Entities/AppUser';


@Injectable({
  providedIn: 'root'
})
export class UserinfoService {//unused
  constructor(private readonly httpClient:HttpClient) {}

  async getUserInfo(id:any,token:any){
    const response = await fetch(`https://localhost:5001/api/users/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    var result  = (await response.json());
    return result;
  }
}
