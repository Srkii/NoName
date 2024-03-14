import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskpageService {

  constructor() { }

  check():boolean{
    const role=localStorage.getItem('role')
    if(role === '2')
      return true;
    else return false;
  }
}
