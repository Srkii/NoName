import { MatDialogModule } from '@angular/material/dialog';
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
import { NavComponent } from './Components/nav/nav.component';
import { AdminComponent } from './Components/admin/admin.component';
import { ForgotPassComponent } from './Components/forgot-pass/forgot-pass.component';
import { ForgotResetComponent } from './Components/forgot-reset/forgot-reset.component';
import { MyProjectsComponent } from './Components/my-projects/my-projects.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyTasksComponent } from './Components/my-tasks/my-tasks.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ProjectDetailComponent } from './Components/project-detail/project-detail.component';
import { FileUploadComponent } from './Components/file-upload/file-upload.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { PopupComponent } from './Components/popup/popup.component';
import { KanbanComponent } from './Components/kanban/kanban.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GanttComponent } from './Components/gantt/gantt.component';
import { ProjectCardComponent } from './Components/project-card/project-card.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AvatarModule } from 'ngx-avatars';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotificationsComponent } from './Components/notifications/notifications.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxGanttModule } from '@worktile/gantt';
import { LandingPageComponent } from './Components/landing-page/landing-page.component';

const avatarColors = ["#4BC5BF", "#5d57c2", "#B84BC5", "#25BA17", "#EDEC07","#07AFED"];

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    UserInfoComponent,
    NavComponent,
    AdminComponent,
    ForgotPassComponent,
    ForgotResetComponent,
    MyProjectsComponent,
    MyTasksComponent,
    PopupComponent,
    ProjectDetailComponent,
    FileUploadComponent,
    KanbanComponent,
    GanttComponent,
    ProjectCardComponent,
    NotificationsComponent,
    LandingPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
    }),
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    DragDropModule,
    ModalModule.forRoot(),
    MatDatepickerModule,
    MultiSelectModule,
    NgSelectModule,
    AvatarModule.forRoot({
      colors: avatarColors
    }),
    ButtonsModule.forRoot(),
    ImageCropperModule,
    NgxGanttModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
