import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Components/register/register.component';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { UserInfoComponent } from './Components/user-info/user-info.component';
import { AdminComponent } from './Components/admin/admin.component';
import { adminGuard } from './_guards/admin.guard';
import { loginGuard } from './_guards/login.guard';
import { authGuard } from './_guards/auth.guard';
import { MyProjectsComponent } from './Components/my-projects/my-projects.component';
import { ForgotPassComponent } from './Components/forgot-pass/forgot-pass.component';
import { ForgotResetComponent } from './Components/forgot-reset/forgot-reset.component';
// import { MyTasksComponent } from './Components/my-tasks/my-tasks.component';
import { ProjectDetailComponent } from './Components/project-detail/project-detail.component';
import { MyTasksComponent } from './Components/my-tasks/my-tasks.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'forgotpass', component: ForgotPassComponent, canActivate: [loginGuard] },
  { path: 'forgotreset', component: ForgotResetComponent, canActivate: [loginGuard] },
  { path: 'project/:id', component: ProjectDetailComponent},
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'userinfo', component: UserInfoComponent },
      { path: 'myprojects', component: MyProjectsComponent },
      { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
      { path: 'mytasks', component: MyTasksComponent}
    ],
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
