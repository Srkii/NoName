import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { ForgotPassComponent } from './Components/forgot-pass/forgot-pass.component';
import { ForgotResetComponent } from './Components/forgot-reset/forgot-reset.component';
import { MyProjectsComponent } from './Components/my-projects/my-projects.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyTasksComponent } from './Components/my-tasks/my-tasks.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PopupComponent } from './Components/popup/popup.component';
import { ProjectDetailComponent } from './Components/project-detail/project-detail.component';
import { FileUploadComponent } from './Components/file-upload/file-upload.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';import { PopupComponent } from './Components/popup/popup.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    UserInfoComponent,
    HomeComponent,
    NavComponent,
    AdminComponent,
    ForgotPassComponent,
    ForgotResetComponent,
    MyProjectsComponent,
    MyTasksComponent,
    PopupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
    }), // ToastrModule added
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
