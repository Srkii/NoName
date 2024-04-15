import { ApiUrl } from '../ApiUrl/ApiUrl'
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private readonly httpClient:HttpClient) { }
  private apiUrl = ApiUrl.apiUrl;
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
  getImage(filename:string){
    return this.httpClient.get(`${this.baseUrl}/images/${filename}`,{responseType:'blob'});
  }

  UploadFile(id:any,file:File,token:any){//neki nacin za pronalazenje id-a taska
    //upload logic
    //nije gotovo
    const formData = new FormData();
    formData.append('file',file,file.name);

    var httpheader = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });

    return this.httpClient.post<any>(`https://localhost:5001/api/FileUpload/uploadfile/${id}`,formData,{headers:httpheader});
  }
}
