import { ApiUrl } from './../ApiUrl/ApiUrl';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private readonly httpClient:HttpClient) { }
  private apiurl = ApiUrl.ApiUrl;

  UploadImage(id:any,imageData:File,token:any){
    const formData = new FormData();
    formData.append('image',imageData,imageData.name);

    var httpheader = new HttpHeaders({
      "Authorization":`Bearer ${token}`
    });

    return this.httpClient.post<any>(`https://localhost:5001/api/FileUpload/uploadpfp/${id}`,formData,{headers:httpheader});//saljem sliku na back
  }
  getImage(id:any,token:any){
    var httpheader = new HttpHeaders({
      "Authorization":`Bearer ${token}`
    });
    return this.httpClient.get<string>(`https://localhost:5001/api/FileUpload/images/${id}`,{headers:httpheader});
  }
}
