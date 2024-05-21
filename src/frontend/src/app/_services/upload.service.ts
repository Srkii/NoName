import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private readonly httpClient:HttpClient) { }
  private apiUrl = environment.apiUrl;
  private fileurl = environment.fileurl;
  private baseUrl = `${this.apiUrl}/FileUpload`;
  UploadImage(id:any,imageData:File,token:any){
    const formData = new FormData();
    formData.append('image',imageData,imageData.name);
    var httpheader = new HttpHeaders({
      "Authorization":`Bearer ${token}`
    });
    //tico: koristi apiUrl ako si ga vec importovao
    return this.httpClient.post<any>(`${this.baseUrl}/uploadpfp/${id}`,formData,{headers:httpheader});//saljem sliku na back
  }
  getImage(filename:string){//ova vraca avatare
    return `${environment.imageUrl}AVATAR_${filename}`;
  }
  getProfileImage(filename:string){
    return `${environment.imageUrl}${filename}`;
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
  removePfp(id:any,token:any){
    var httpheader = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });
    return this.httpClient.delete<any>(`${this.apiUrl}/FileUpload/removepfp/${id}`,{headers:httpheader});
  }

  downloadFile(fileUrl:string){
    const token = localStorage.getItem('token');
    var httpheader = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });
    return this.httpClient.get(`${this.fileurl}${fileUrl}`, { responseType: 'blob',headers:httpheader});
  }
}
