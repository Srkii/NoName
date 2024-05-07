import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { ComponentRef, Injectable} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CustomToastService } from './custom-toast.service';
import { SharedService } from './shared.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService{
  hubUrl = environment.hubUrl;
  newNotifications:boolean = false;//flag koji dopusta izvlacenje novih notifikacija sa backenda -> ukoliko nema novih notifikacija user ne sme da ima pravo da spamuje requestove klikom na zvonce
  private hubConnection?:HubConnection;


  notifications : Notification[] = [];
  allNotifications:Notification[] = [];


  constructor(
    private toastr:ToastrService,//mogu opet preko hub-a da uzimam notifikacije i ne bakcem se sa httpclientom ura!
    private customToast:CustomToastService,
    private shared:SharedService,
    private router:Router
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
      this.toastr.success("You have unread notifications!");
      this.newNotifications = true;
    });

    this.hubConnection.on('Notify',(notification:any)=>{
      //sad dobija celiu novu notifikaciju da je prikaze u donjem desnom cosku
      this.notifications.push(notification);
      this.allNotifications.push(notification);
      this.newNotifications = true;
      this.customToast.initiate(
        {
          target:notification,
          title:'New Notification!',
          content:this.getNotificationText_small(notification)
        }
      )
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
  getNotificationType(type:any):string{
    switch(type){
      case 0:
        return "uploaded an attachment on a task ";
      case 1:
        return "commented on a task";
      case 2:
        return "You have been assigned to a task";
      case 3:
        return "You have been assigned to a project";
      case 4:
        return "A task deadline has been modified";
      case 5:
        return "A project deadline has been modified";
      default:
        return "";
    }
  }
  getNotificationText(notification:any):string{
    switch(notification.type){
      case 0://attachment
        return notification.sender.firstName+" "+notification.sender.lastName+" "+this.getNotificationType(notification.type)+" "+notification.task.taskName;
      case 1://comment
        return notification.sender.firstName+" "+notification.sender.lastName+" "+this.getNotificationType(notification.type)+" "+notification.task.taskName;
      case 2:
        return this.getNotificationType(notification.type)+" "+notification.task.taskName;
      default:
        return this.getNotificationType(notification.type)+" "+notification.project.projectName;//pravi jos tipova...

    }
  }
  getNotificationText_small(notification:any):string{
    switch(notification.type){
      case 0://attachment
        return notification.sender.firstName+" "+notification.sender.lastName+" "+this.getNotificationType(notification.type);
      case 1://comment
        return notification.sender.firstName+" "+notification.sender.lastName+" "+this.getNotificationType(notification.type);
      case 2:
        return this.getNotificationType(notification.type);
      default:
        return this.getNotificationType(notification.type);

    }
  }

  async follow_notif(event: MouseEvent, notification: any) {
    if (notification.task != null) {
      event.stopPropagation();
      await this.router.navigate(['/project/' + notification.task.projectId]);
      setTimeout(()=>{
        this.shared.triggerPopup(event, notification.task.id);  //mogu da ga aktiviram ali ne mogu nista dalje da mu uradim xd.
      },500);
    } else if (notification.project != null) {
      await this.router.navigate(['/project/' + notification.project.id]);
    }
  }

}
