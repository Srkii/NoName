import { Invintation } from './../Entities/Invitation';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { HubUrl } from './../ApiUrl/HubUrl';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppUser } from '../Entities/AppUser';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService{
  hubUrl = HubUrl.hubUrl;
  newNotifications:boolean = false;//flag koji dopusta izvlacenje novih notifikacija sa backenda -> ukoliko nema novih notifikacija user ne sme da ima pravo da spamuje requestove klikom na zvonce
  private hubConnection?:HubConnection;
  notifications : Notification[] = [];

  constructor(private toastr:ToastrService) { }

  createHubConnection(){
    var token = localStorage.getItem('token');
    this.hubConnection = new HubConnectionBuilder()

      .withUrl(this.hubUrl+'notifications', {
        accessTokenFactory: () => token ? token : ''
      })

      .withAutomaticReconnect([0,3000,5000])

      .build();
    this.hubConnection.start().catch(error =>{
      console.log(error);
  });

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
      this.newNotifications = false;
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
