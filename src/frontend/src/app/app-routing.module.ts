import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Components/register/register.component';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { UserinfoService } from './Services/userinfo.service';
import { UserInfoComponent } from './Components/user-info/user-info.component';
import { AdminComponent } from './Components/admin/admin.component';
import { adminGuard } from './Guards/admin.guard';
const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'userinfo', component: UserInfoComponent },
  { path: 'admin', component: AdminComponent, canActivate:[adminGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
