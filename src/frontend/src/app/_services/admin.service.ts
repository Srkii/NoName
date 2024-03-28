import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { Observable, of } from 'rxjs';

import { Member } from '../Entities/Member';
import { ChangeRole } from '../Entities/ChangeRole';
import { UpdateUser } from '../Entities/UpdateUser';
import { AppUser } from '../Entities/AppUser';
import { RegisterInvitation } from '../Entities/RegisterInvitation';

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

  sendInvatation(invData: RegisterInvitation): Observable<any>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.httpClient.post<any>(`${this.apiUrl}/email/sendInvitation`,invData,httpOptions)
  }

  getAllUsers(): Observable<any>{
    let token=localStorage.getItem("token");
    if(token)
    {
      let httpHeader=new HttpHeaders({
        "Authorization": `Bearer ${token}`
      });

      return this.httpClient.get<Member[]>(`${this.apiUrl}/users`,{headers:httpHeader})
    }
    else return of(null); //u slucaju da nisam ulogovan i nemam korisnika nemoj da mi uzimas info o korisniku
  }

  //updateUser
  updateUser(id: number, user:UpdateUser): Observable<any>{
    let token=localStorage.getItem("token");
    if(token)
    {
      let httpHeader=new HttpHeaders({
        "Authorization": `Bearer ${token}`
      });

      return this.httpClient.put<Member>(`${this.apiUrl}/users/updateUser/${id}`,user,{headers:httpHeader})
    }
    else return of(null); 
  }

  //ArchiveUser
  archiveUser(id: number): Observable<any> {
    const token = localStorage.getItem('jwt_token')

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      })
    };

    return this.httpClient.post(`${this.apiUrl}/users/setAsArchived/${id}`, null, httpOptions);
  }

  changeUserRole(response: ChangeRole): Observable<any>{
    let token=localStorage.getItem("token");
    if(token)
    {
      let httpHeader=new HttpHeaders({
        "Authorization": `Bearer ${token}`
      });

      return this.httpClient.post<ChangeRole>(`${this.apiUrl}/users/changeUserRole`,response,{headers:httpHeader})
    }
    else return of(null); 
  }

  //getPhotoByUserId
}
