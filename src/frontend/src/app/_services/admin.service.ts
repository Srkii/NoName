import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Member } from '../Entities/Member';
import { ChangeRole } from '../Entities/ChangeRole';
import { UpdateUser } from '../Entities/UpdateUser';
import { RegisterInvitation } from '../Entities/RegisterInvitation';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpClient:HttpClient) { }

  private apiUrl=environment.apiUrl;

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

  getAllUsers1(pageNumber: number, pageSize: number, role: string|null, searchTerm: string|null): Observable<any>{

    var params=new HttpParams();

    if(role){
      params=params.set('role',role);
    }
    if (pageNumber) {
      params = params.set('currentPage', pageNumber.toString());
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize.toString());
    }

    if(searchTerm){
      params=params.set('searchTerm', searchTerm);
    }


    return this.httpClient.get<Member[]>(`${this.apiUrl}/users/filtered`,{params:params})

  }

  getFilterCount(role:string|null): Observable<number>
  {
    var params=new HttpParams();

    if(role){
      params=params.set('role',role);
    }

    return this.httpClient.get<number>(`${this.apiUrl}/users/filteredCount`,{params: params});
  }

  getAllUsers2():Observable<number>{
    return this.httpClient.get<number>(`${this.apiUrl}/users/all`);
  }

  getAllUsers3(role:string|null):Observable<any>{
    var params=new HttpParams();

    if(role){
      params=params.set('role',role);
    }
    return this.httpClient.get<Member[]>(`${this.apiUrl}/users/getByRole`,{params: params});
  }


}
