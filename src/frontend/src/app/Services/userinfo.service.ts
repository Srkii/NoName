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
    console.log(result);
    return result;
  }

  async updateUserInfo(newdata:any,id:any,token:any){
    console.log("UPDATEUSERINFO begins...");
    /*
    ideja je da se na osnovu odgovora od api-a informise korisnik o uspesnosti promene podataka
    moguce komplikacije:
      server ne odgovori
      omasena sifra
      greska u requestu kod mene(nadajmo se da nece to da bude)
    */
   const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`).set('Content-Type','application/json');
   return await this.httpClient.put<any>(`https://localhost:5001/api/users/update/${id}`,newdata,{headers})
  }
}
