import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private readonly httpClient:HttpClient) { }

  UploadImage(id:any,imageData:File,token:any){
    const formData = new FormData();
    formData.append('image',imageData,imageData.name);
    console.log(formData);
    var httpheader = new HttpHeaders({
      "Authorization":`Bearer ${token}`
    });
    return this.httpClient.post<any>(`https://localhost:5001/api/FileUpload/uploadpfp/${id}`,formData,{headers:httpheader});//saljem sliku na back
  }
  getImage(filename:string){
    var result =  this.httpClient.get(`https://localhost:5001/api/FileUpload/images/${"AVATAR_"+filename}`,{responseType:'blob'})

    return result.pipe(
      map((blob:Blob) => URL.createObjectURL(blob))
    );
  }
  getProfileImage(filename:string){
    var result =  this.httpClient.get(`https://localhost:5001/api/FileUpload/images/${filename}`,{responseType:'blob'})

    return result.pipe(
      map((blob:Blob) => URL.createObjectURL(blob))
    );
  }

  UploadFile(id:any,user_id:any,file:File,token:any){
    const formData = new FormData();
    formData.append('file',file,file.name);
    formData.append('user_id',String(user_id));
    var httpheader = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });

    return this.httpClient.post<any>(`https://localhost:5001/api/FileUpload/uploadfile/${id}`,formData,{headers:httpheader});
  }
}
