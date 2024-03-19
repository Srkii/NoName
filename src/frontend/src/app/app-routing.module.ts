import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Components/register/register.component';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { UserInfoComponent } from './Components/user-info/user-info.component';
import { AdminComponent } from './Components/admin/admin.component';
import { adminGuard } from './Guards/admin.guard';
import { loginGuard } from './Guards/login.guard';
import { authGuard } from './Guards/auth.guard';
import { TaskPageComponent } from './Components/task-page/task-page.component';
import { taskpageGuard } from './Guards/taskpage.guard';
import { ForgotPassComponent } from './Components/forgot-pass/forgot-pass.component';
import { ForgotResetComponent } from './Components/forgot-reset/forgot-reset.component';
const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'forgotpass', component: ForgotPassComponent, canActivate: [loginGuard] },
  { path: 'forgotreset', component: ForgotResetComponent, canActivate: [loginGuard] },
  { path: '',
    runGuardsAndResolvers:'always',
    canActivate:[authGuard],
    children:[
      { path: 'home', component: HomeComponent },
      { path: 'userinfo', component: UserInfoComponent },
      { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
      { path: 'taskpage', component: TaskPageComponent, canActivate: [taskpageGuard] }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
