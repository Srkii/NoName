import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './Components/register/register.component';
import { LoginComponent } from './Components/login/login.component';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from './Components/user-info/user-info.component';
import { HomeComponent } from './Components/home/home.component';
import { NavComponent } from './Components/nav/nav.component';
import { AdminComponent } from './Components/admin/admin.component';
import { TaskPageComponent } from './Components/task-page/task-page.component';
<<<<<<< HEAD
import { MyProjectsComponent } from './Components/my-projects/my-projects.component';
=======
import { ForgotPassComponent } from './Components/forgot-pass/forgot-pass.component';
import { ForgotResetComponent } from './Components/forgot-reset/forgot-reset.component';
>>>>>>> db6c1897c339a32591db5dfdcb1743d4225cf7c5

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    UserInfoComponent,
    HomeComponent,
    NavComponent,
    AdminComponent,
    TaskPageComponent,
<<<<<<< HEAD
    MyProjectsComponent,
=======
    ForgotPassComponent,
    ForgotResetComponent,
>>>>>>> db6c1897c339a32591db5dfdcb1743d4225cf7c5
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
