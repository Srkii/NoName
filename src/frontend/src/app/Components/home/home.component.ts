import { Router } from '@angular/router';
import { UserinfoService } from '../../_services/userinfo.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router:Router){}
  async onClickUser():Promise<void>{
    try{
      this.router.navigate(['/userinfo'])
    }catch(error){
      console.error("redirect failed:",error);
    }
  }
  async onClickHome():Promise<void>{
    try{
      this.router.navigate(['/home'])
    }
    catch(error){
      console.error("redirect failed:",error);
    }
  }
}
