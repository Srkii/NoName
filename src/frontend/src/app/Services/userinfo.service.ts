import { ApiUrl } from './../ApiUrl/ApiUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUser } from '../Entities/AppUser';
import { ChangeUserData } from '../Entities/ChangeUserData';


@Injectable({
  providedIn: 'root'
})
export class UserinfoService {
  constructor(private readonly httpClient:HttpClient) {}

  async getUserInfo(id:any,token:any){
    const url = `https://localhost:5001/api/users/updateUser/${id}`;
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
  async getProfilePhoto(id:any,token:any){
    const url = `https://localhost:5001/api/users/profilePic/${id}`;
    const response = await fetch(
      url,{
      method:'GET',
      headers:{
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    var result = (await response.json());
    return result;
  }
  updateUserInfo(token: any, id:number, newdata:ChangeUserData):Observable<any>{
    const url = `https://localhost:5001/api/users/updateUser/${id}`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    const response = this.httpClient.put<any>(url,JSON.stringify(newdata),{headers})
    return response;
  }
}
