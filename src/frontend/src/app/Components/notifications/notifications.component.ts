import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../_services/notifications.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit{
  public notification_list:any = [];
  constructor (private notificationService:NotificationsService,private spinner:NgxSpinnerService ){}
  ngOnInit(): void {
    this.spinner.show();
  }
  async getNotifications(){//kupimo notifikacije
    await this.notificationService.getNotifications();
    this.notification_list = this.notificationService.notifications;
  }

  read_notification(){
    //saljem request bazi da stavi notifikaciji read=true
  }
  follow_link(){
    //dodati notifikaciji task_id ili project_id da zna na sta da ide, na osnovu toga otvaramo popup za task ako treba ili za projekat koji je dodat
  }
}
