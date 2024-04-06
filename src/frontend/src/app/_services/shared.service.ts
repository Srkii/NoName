import { Injectable } from '@angular/core';
import { ProjectTask } from '../Entities/ProjectTask';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  current_task_id:any = null;
  constructor() { }
  //ovo koristiti za deljene funkcionalnosti i promenljive unutar koda,
  //bolje nego local storage da postane deponija
}
