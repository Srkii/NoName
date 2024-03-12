import { ApiUrl } from './../ApiUrl/ApiUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUser } from '../Entities/AppUser';
import { ChangeUserData } from '../Entities/ChangeUserData';


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

  updateUserInfo(token: any, id:number, newdata:ChangeUserData){
    const url = `https://localhost:5001/api/users/updateUser/${id}`;
    const response = fetch(url,{
      method:'PUT',
      headers:{
        Authorization:`Bearer ${token}`,
        'Content-Type':'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(newdata)
    });
    return response;
  }
}
