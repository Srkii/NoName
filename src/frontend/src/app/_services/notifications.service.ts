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

    this.hubConnection.on('UserIsOnline',username =>{
      console.log("ONLINE : ",username);
      this.toastr.info(username + " has come online")
    });//sad samo dodajem redom sta treba da slusa
    this.hubConnection.on('NewTask', response=>{
      this.addNotification("There is a new task assigned to you.");
    });
    this.hubConnection.on('NewProject', response=>{
      this.addNotification("A new project has been assigned to you.");
    });
    this.hubConnection.on('RemovedFromTask', response=>{
      this.addNotification("You have been removed from a task.");
    });
    this.hubConnection.on('RemovedFromProject', response=>{
      this.addNotification("You have been removed from a project.");
    });
    this.hubConnection.on('Comment', response=>{
      this.addNotification("Someone commented on a task you're on.");
    });
    this.hubConnection.on('Attachment', response=>{
      this.addNotification("Someone uploaded an attachment on a task you're on. "+response);
    });
  }

  stopHubConnection(){
    this.hubConnection?.stop().catch(error => console.log(error));
  }
  addNotification(text:string){
    console.log(text);
  }
}
