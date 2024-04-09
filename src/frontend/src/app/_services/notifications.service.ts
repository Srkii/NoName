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

    this.hubConnection.on('newNotifications',response =>{
      this.toastr.info("New notifications have arrived");
      console.log("notifications while you were gone: "+response);
    });
    this.hubConnection.on('NotifyAttachment',response=>{
      this.toastr.info("A NEW NOTIFICATION HAS ARRIVED");
      console.log(response);
    })
  }

  stopHubConnection(){
    this.hubConnection?.stop().catch(error => console.log(error));
  }
  addNotification(text:string){
    console.log(text);
  }
}
