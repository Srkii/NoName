import { Component } from '@angular/core';
import { RegisterService } from '../../Services/register.service';
import { AppUser } from '../../Entities/AppUser';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private registerService:RegisterService,private router:Router){}

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
      this.router.navigate(['/login']);
    },error:()=>{
      console.log("Unsuccessful registration")
    }})
  }
}
