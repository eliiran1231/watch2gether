import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Message, Participant, permissionUpdate, Room, VideoEvent, WatcherPermissions, WatchingRoom } from '../watch-component/types';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { resolve } from 'path';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomSyncService {
  private hubConnection : signalR.HubConnection|undefined;
  constructor(private http:HttpClient, private router:Router){}
  serverHost = "https://localhost:7015";
  // Start the connection
  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.serverHost+'/watchingHub',{
        withCredentials:true,
      }) // The URL of your Hub
      .build();

    return this.hubConnection
      .start();
  }

  public getRooms(){
    return fetch(this.serverHost+"/rooms").then(res=>res.json()) as Promise<Room[]>
  }

  // Method to send a message to the server
  public async sendMessage(message: string) {
    if(!this.hubConnection) throw new Error("no connection was made"); 
    return this.hubConnection.invoke('SendMessage', message,);
  }

  public joinRoom(id: number) {
    if(!this.hubConnection) throw new Error("no connection was made");
    return this.hubConnection.invoke('JoinRoom', id);
  }

  public async terminateConnection(){
    this.hubConnection?.off("VideoEvent");
    this.hubConnection?.off("ReceiveMessage");
    this.hubConnection?.off("participantJoined");
    this.hubConnection?.off("participantLeft");
    this.hubConnection?.off("permissionUpdate");
    return this.hubConnection?.stop().then(()=>this.hubConnection=undefined);
  }

  // Method to leave a room
  public leaveRoom() {
    if(!this.hubConnection) throw new Error("no connection was made");
    this.hubConnection.invoke('LeaveRoom')
      .catch(err => console.error(err));
  }

  // Method to listen for incoming messages
  public onReceiveMessage(callback: (data: Message) => void) {
    if(!this.hubConnection) throw new Error("no connection was made");
    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      callback(message);
    });
  }

  // Method to listen for participants joining
  public onParticipantJoined(callback: (data: Participant) => void) {
    if(!this.hubConnection) throw new Error("no connection was made");
    this.hubConnection.on('participantJoined', (data: Participant) => {
      callback(data);
    });
  }

  // Method to listen for participants leaving
  public onParticipantLeft(callback: (data: Participant) => void) {
    if(!this.hubConnection) throw new Error("no connection was made");
    this.hubConnection.on('participantLeft', (data: Participant) => {
      callback(data);
    });
  }

  public onVideoEvent(callback: (data:{videoEvent:VideoEvent,from:Participant}) => void){
    if(!this.hubConnection) throw new Error("no connection was made");
    this.hubConnection.on('VideoEvent', (data:{videoEvent:VideoEvent,from:Participant}) => {
      callback(data);
    });
  }

  public onPermissionUpdated(callback: (data:permissionUpdate) => void){
    this.hubConnection?.on("permissionUpdate",(data:permissionUpdate)=>{
      callback(data);
    })
  }

  public sendVideoEvent(event:VideoEvent){
    if(!this.hubConnection) throw new Error("no connection was made");
    return this.hubConnection.invoke("VideoEvent",event);
  }

  public setPermission(participant:Participant,action:string,isPermmited:boolean){
    if(!this.hubConnection) throw new Error("no connection was made");
    return this.hubConnection.invoke("SetPermission",{participant,action,isPermmited});
  }

  public async getRoom(id:number):Promise<WatchingRoom>{
    const res = await fetch(this.serverHost + "/watchingroom?id=" + id);
    const room = await res.json();
    return new WatchingRoom(room.name, room.id, room.vidURL, room.participants.map((p: Participant) => new Participant(p.name, p.id, new WatcherPermissions(p.permissions))));
  }
  public createRoom(vidURL:string,name:string,nickName:string){
    this.http.post<WatchingRoom>(this.serverHost+'/create', {vidURL,name,nickName}, {withCredentials:true}).subscribe({
      next: (response) => {
        let driecrto = "watchingroom/"+response.id;
        this.router.navigate([driecrto]);
      },
      error: (error) => {
        console.error('Error sending data', error);
      }
    });
  }
  public registerToRoom(id: number, nickName: string) {  
    return new Promise(resolve => {
      this.http.post<Participant>(this.serverHost + "/registerRoom?id=" + id, { nickName }, { withCredentials: true }).subscribe((response) => {
        resolve(new Participant(response.name,response.id,new WatcherPermissions(response.permissions)));
      });
    })
  }
  public uploadVideo(form: FormData) {
    return this.http.post<any>(this.serverHost + "/uploadVideo", form, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          return { progress: Math.round((100 * event.loaded) / event.total), url: null };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, url: event.body.url };
        }
        return { progress: 0, url: null };
      })
    );
  }

}
