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

  private token: string;
  private httpHeader: HttpHeaders;

  constructor(private httpClient:HttpClient) {
    this.token = localStorage.getItem('token') || '';
    this.httpHeader=new HttpHeaders({"Authorization": `Bearer ${this.token}`});
  }

  private apiUrl=environment.apiUrl;

  check():boolean{
    const role=localStorage.getItem('role')

    if(role==='0')
      return true;
    else return false
  }

  sendInvatation(invData: RegisterInvitation): Observable<any>{
    return this.httpClient.post<any>(`${this.apiUrl}/email/sendInvitation`,invData,{headers:this.httpHeader})
  }

  getAllUsers(): Observable<any>{
    if(this.token)
      return this.httpClient.get<Member[]>(`${this.apiUrl}/users`,{headers:this.httpHeader})
    return of(null);
  }

  updateUser(id: number, user:UpdateUser): Observable<any>{
    if(this.token)
      return this.httpClient.put<Member>(`${this.apiUrl}/users/updateUser/${id}`,user,{headers:this.httpHeader})
    return of(null);
  }

  archiveUser(id: number): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/users/setAsArchived/${id}`, null, {headers:this.httpHeader});
  }

  changeUserRole(response: ChangeRole): Observable<any>{
    if(this.token)
      return this.httpClient.post<ChangeRole>(`${this.apiUrl}/users/changeUserRole`,response,{headers:this.httpHeader})
    return of(null);
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

    return this.httpClient.get<Member[]>(`${this.apiUrl}/users/filtered`,{params:params,headers:this.httpHeader})
  }

  getCount(role: string|null, searchTerm: string|null): Observable<any>{

    var params=new HttpParams();

    if(role) {
      params=params.set('role',role);
    }
    if(searchTerm) {
      params=params.set('searchTerm', searchTerm);
    }

    return this.httpClient.get<number>(`${this.apiUrl}/users/fcount`,{params:params,headers:this.httpHeader})
  }

  getFilterCount(role:string|null): Observable<number>
  {
    var params=new HttpParams();

    if(role){
      params=params.set('role',role);
    }

    return this.httpClient.get<number>(`${this.apiUrl}/users/filteredCount`,{params: params,headers:this.httpHeader});
  }

  getAllUsers2():Observable<number>{
    return this.httpClient.get<number>(`${this.apiUrl}/users/all`,{headers:this.httpHeader});
  }

  getAllUsers3(role:string|null):Observable<any>{
    var params=new HttpParams();

    if(role){
      params=params.set('role',role);
    }
    return this.httpClient.get<Member[]>(`${this.apiUrl}/users/getByRole`,{params: params,headers:this.httpHeader});
  }

  getArchivedUsers():Observable<any>{
    return this.httpClient.get<Member[]>(`${this.apiUrl}/users/getArchived`,{headers:this.httpHeader});
  }

  removeFromArchieve(usersIds:number[]):Observable<any>{
    return this.httpClient.put<Member[]>(`${this.apiUrl}/users/removeFromArch`,usersIds,{headers:this.httpHeader})
  }
}
