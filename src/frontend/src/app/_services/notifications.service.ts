import { Invintation } from './../Entities/Invitation';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { HubUrl } from './../ApiUrl/HubUrl';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppUser } from '../Entities/AppUser';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  hubUrl = HubUrl.hubUrl;
  private hubConnection?:HubConnection;
  _notifs : Notification[] = [];

  constructor(private toastr:ToastrService) { }

  createHubConnection(user:AppUser){
    var token = localStorage.getItem('token');
    this.hubConnection = new HubConnectionBuilder()

      .withUrl(this.hubUrl+'notifications', {
        accessTokenFactory: () => token ? token : ''
      })

      .withAutomaticReconnect()

      .build();
    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('newNotifications',response =>{//ovo mi onda u sustini ne treba ako cu ja sa fronta da invokeujem getter za notifikacije
      console.log(response);
      this.toastr.info("New notifications have arrived");
    });

    this.hubConnection.on('NotifyAttachment',(notification:Notification)=>{//za svaku sad isto...
      this.toastr.info("A NEW NOTIFICATION HAS ARRIVED");
      console.log(notification);
      this.addNotification(notification);
    })

    this.hubConnection.on('NotifyComment',(notification:Notification)=>{
      this.toastr.info("Someone has commented on your task..");
      console.log(notification);
      this.addNotification(notification);
    })
    this.hubConnection.on('sendNotifications',(notifications:[Notification])=>{
      this._notifs = notifications;
      console.log(notifications);
    });
  }
  stopHubConnection(){
    this.hubConnection?.stop().catch(error => console.log(error));
  }
  addNotification(notification:Notification){
    this._notifs.push(notification);
  }
  getNotifications(){
    this.hubConnection?.invoke('invokeGetNotifications');
  }
}
