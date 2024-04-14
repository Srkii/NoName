import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { HubUrl } from './../ApiUrl/HubUrl';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService{
  hubUrl = HubUrl.hubUrl;
  newNotifications:boolean = false;//flag koji dopusta izvlacenje novih notifikacija sa backenda -> ukoliko nema novih notifikacija user ne sme da ima pravo da spamuje requestove klikom na zvonce
  private hubConnection?:HubConnection;
  notifications : Notification[] = [];
  allNotifications:Notification[] = [];

  constructor(
    private toastr:ToastrService,//mogu opet preko hub-a da uzimam notifikacije i ne bakcem se sa httpclientom ura!
  ) { }

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
      this.notifications = notifications;
      this.newNotifications = false;
    });

    this.hubConnection.on('recieveAllNotifications',(notifications:[Notification])=>{
      this.allNotifications = notifications;//pokupim sve u niz
    })
  }
  stopHubConnection(){
    this.hubConnection?.stop().catch(error => console.log(error));
  }
  async getNotifications(){
    //invoke funkcije na back-u kad se klikne na zvonce
    if(this.newNotifications){
      await this.hubConnection?.invoke('invokeGetNotifications');//top 10 najskorijih neprocitanih notif
      this.newNotifications = false;//ucitao nove notifikacije, nema potrebe da opet poziva getter
    }
  }
  async getAllNotifications(){
    await this.hubConnection?.invoke('invokeGetAllNotifications');//sve notifikacije sortirane prvo po vremenu, pa onda po tome da li su procitane...
  }
  read_notifications(notificationIds:number[]){
    this.hubConnection?.invoke("readNotifications",notificationIds);
  }
  follow_link(){
    //dodati notifikaciji task_id ili project_id da zna na sta da ide, na osnovu toga otvaramo popup za task ako treba ili za projekat koji je dodat
  }

}
