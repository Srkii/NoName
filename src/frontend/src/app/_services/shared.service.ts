import { EventEmitter, Injectable } from '@angular/core';
import { ProjectTask } from '../Entities/ProjectTask';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  current_task_id:any = null;
  private apiUrl = environment.apiUrl;

  private togglePopupSource = new Subject<{ event: MouseEvent, taskId: number }>();
  togglePopup$ = this.togglePopupSource.asObservable();
  taskUpdated: EventEmitter<void> = new EventEmitter();
  constructor(private http: HttpClient) {}
  //ovo koristiti za deljene funkcionalnosti i promenljive unutar koda,
  //bolje nego local storage da postane deponija

  IsTokenValid(token: string):Observable<boolean>{
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    return this.http.get<boolean>(`${this.apiUrl}/account/validToken/${token}`,{ headers });
  }

  triggerPopup(event: MouseEvent, taskId: number) {
    this.togglePopupSource.next({ event, taskId });
  }
  emitTaskUpdated() {
    this.taskUpdated.emit();
  }

  // emit za novi task
  private taskAddedSource = new Subject<boolean>();
  taskAdded$ = this.taskAddedSource.asObservable();
  taskAdded(success: boolean) {
    this.taskAddedSource.next(success);
  }
}
