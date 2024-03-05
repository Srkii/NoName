import { Component } from '@angular/core';
import { RegisterService } from '../../Services/register.service';
import { AppUser } from '../../Entities/AppUser';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private registerService:RegisterService){}

  newUser:AppUser={
    FirstName: '',
    LastName: '',
    Email: '',
    Password: ''
  }

  Regsiter(): void{
    this.registerService.register(this.newUser).subscribe({next:(res: string)=>{
      localStorage.setItem('token',res);
      console.log("Successful registration")
    },error:()=>{
      console.log("Unsuccessful registration")
    }})
  }
}
