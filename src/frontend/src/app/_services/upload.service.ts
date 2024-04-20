import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiUrl } from '../ApiUrl/ApiUrl';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private readonly httpClient:HttpClient) { }
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/FileUpload`;
  UploadImage(id:any,imageData:File,token:any){
    const formData = new FormData();
    formData.append('image',imageData,imageData.name);
    console.log(formData);
    var httpheader = new HttpHeaders({
      "Authorization":`Bearer ${token}`
    });
    //tico: koristi apiUrl ako si ga vec importovao
    return this.httpClient.post<any>(`${this.baseUrl}/uploadpfp/${id}`,formData,{headers:httpheader});//saljem sliku na back
  }
  getImage(filename:string){//ova vraca avatare
    return `${ApiUrl.imageUrl}AVATAR_${filename}`;
  }
  getProfileImage(filename:string){
    return `${ApiUrl.imageUrl}${filename}`;
  }

  UploadFile(id:any,user_id:any,file:File,token:any){
    const formData = new FormData();
    formData.append('file',file,file.name);
    formData.append('user_id',String(user_id));
    var httpheader = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });

    return this.httpClient.post<any>(`${this.apiUrl}/FileUpload/uploadfile/${id}`,formData,{headers:httpheader});
  }
}
