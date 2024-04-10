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
  newNotifications:boolean = false;
  private hubConnection?:HubConnection;
  notifications : Notification[] = [];

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

    this.hubConnection.on('newNotifications',() =>{//ovo mi onda u sustini ne treba ako cu ja sa fronta da invokeujem getter za notifikacije
      this.toastr.info("You have unread notifications!");
      this.newNotifications = true;
    });

    this.hubConnection.on('Notify',()=>{
      //dobija info da je notifikacija stigla
      //stavi crvenu tackicu na zvonce na primer...
      this.toastr.info("New notification!!");
      this.newNotifications = true;
    })
    this.hubConnection.on('recieveNotifications',(notifications:[Notification])=>{
      //ovo preuzima notifikacije sa back-a kad se klikne na zvonce
      this.notifications = notifications;
      console.log(notifications);//brisi posle
    });
  }
  stopHubConnection(){
    this.hubConnection?.stop().catch(error => console.log(error));
  }
  async getNotifications(){
    //invoke funkcije na back-u kad se klikne na zvonce
    await this.hubConnection?.invoke('invokeGetNotifications');
  }
}
