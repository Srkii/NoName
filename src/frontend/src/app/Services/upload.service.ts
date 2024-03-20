import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private readonly httpClient:HttpClient) { }

  async UploadImage(id:any,imageData:File,token:any){
    const url = `https://localhost:5001/api/users/add-photo/${id}`;
    const formData = new FormData();
    formData.append('image',imageData,imageData.name);
    const response = await fetch(
      url,{
      method:'POST',
      body:formData,
      headers:{
        Authorization: `Bearer ${token}`,
        Accept:'application/File'
      },
    });
    var result = (await response.json());
    return result;
  }
  async RemoveImage(id:any,token:any){
    const url = `https://localhost:5001/api/users/remove-photo/${id}`;
    const response = await fetch(
      url,{
        method:'DELETE',
        headers:{
          Authorization:`Bearer ${token}`,
        }
      }
    );
    return response;
  }
}
