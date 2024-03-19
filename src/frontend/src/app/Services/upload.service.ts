import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private readonly httpClient:HttpClient) { }

  UploadImage(fd:FormData){
    console.log(fd);
  }
}
