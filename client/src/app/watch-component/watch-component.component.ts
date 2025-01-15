import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faComment } from '@fortawesome/free-regular-svg-icons';
import { RoomSettingsComponentComponent } from "./room-settings-component/room-settings-component.component";
import { RoomSyncService } from '../services/room-sync.service';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Message, Participant, VideoEvent, WatcherPermissions } from './types';
import { CreateNicknameComponent } from './create-nickname/create-nickname.component';
import { AllowParticipationComponent } from './allow-participation/allow-participation.component';

@Component({
  selector: 'app-watch-component',
  standalone: true,
  imports: [MatSidenavModule, FontAwesomeModule, RoomSettingsComponentComponent, AsyncPipe, CreateNicknameComponent,AllowParticipationComponent],
  templateUrl: './watch-component.component.html',
  styleUrl: './watch-component.component.css'
})
export class WatchComponent{
  @ViewChild('mainVideo') mainVideo!: ElementRef<HTMLVideoElement>;
  handleParticipiantAllowed() {
    this.participantAllowedControl=true;
    this.initVideoSync();
  }
  async handleMeJoind(me:Participant) {
    await this.ngOnInit();
    this.me=me;
    (await this.patricipants).push(this.me);
  }
  sendMessage(input:HTMLInputElement){
    let content = input.value; 
    input.value = "";
    return this.roomService.sendMessage(content);
  }
  bubblePatricipent=1;
  playedByuser = true;
  me: Participant|undefined;
  participantAllowedControl = false;
  bubbleClicked(sidenav:MatSidenav,id: number) {
    sidenav.toggle(true);
    this.bubblePatricipent=id+1;
  }
  route: ActivatedRoute;
  id;
  roomData;
  patricipants;
  vidURL;

  async ngOnInit(){
    await this.roomService.startConnection();
    this.roomService.onParticipantJoined(async (data)=>{
      if((await this.patricipants).find(par=>par.id==data.id)) return;
      (await this.patricipants).push(new Participant(data.name,data.id,new WatcherPermissions(data.permissions)));
    })
    this.roomService.joinRoom(this.id).then((res)=>{
      if(res.statusCode == 404){
        this.roomService.terminateConnection();
        this.me = undefined;
      }
      else this.me = res.value;
    })
    this.roomService.onParticipantLeft(async(participant)=>{
      this.patricipants= this.patricipants.then(par=>par.filter((p)=>p.id!=participant.id));
    })
    this.roomService.onReceiveMessage((msg)=>{
      this.messages.push(msg);
    })
    this.roomService.onPermissionUpdated(async(data)=>{
      let participant = (await this.patricipants).find(participant=>participant.id==data.participant.id);
      participant?.permissions.setPermission(data.action,data.isPermmited);
      this.me=(await this.patricipants).find(participant=>participant.id==this.me?.id);
    })
  }
  //ng serve --ssl true --ssl-key "./ssl/key.pem" --ssl-cert "./ssl/cert.pem"
  constructor(private route2:ActivatedRoute,private roomService:RoomSyncService) {
    this.route=route2;
    this.id=parseInt(this.route.snapshot.paramMap.get('id')||'0')||0;
    this.roomData= this.roomService.getRoom(this.id)
    this.patricipants=this.roomData.then(res=>res.participants);
    this.vidURL= this.roomData.then(res=>res.vidURL);
  }

  initVideoSync(){
    console.warn("video init!");
    let videoElement = this.mainVideo.nativeElement;
    const eventNames = ['pause','play','seeking','seeked'];
    for(const eventName of eventNames){
      videoElement.addEventListener(eventName,(e)=>{
        if(!this.playedByuser) return;
        this.roomService.sendVideoEvent({
          name:eventName,
          details:{
            time:videoElement.currentTime,
            isPlaying:videoElement.paused
          }
        });
      })
    }
    this.roomService.onVideoEvent(async(data)=>{
      if(data.from.id == this.me?.id) return;
      videoElement.currentTime = data.videoEvent.details.time;
      this.playedByuser=false;
      if(!data.videoEvent.details.isPlaying)
        {
          await videoElement.play()
          this.playedByuser=true
        }
      else {
        videoElement.pause();
        requestAnimationFrame(() => {
          this.playedByuser = true;
        });
      }
    })
  }
  comment= faComment;
  messages:Message[]=[];
}