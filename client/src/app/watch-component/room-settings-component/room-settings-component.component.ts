import { Component,OnInit, Input } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { KeyValue, KeyValuePipe } from '@angular/common';
import { Participant, WatcherPermissions } from '../types';
import { RoomSyncService } from '../../services/room-sync.service';

@Component({
  selector: 'app-room-settings-component',
  standalone: true,
  imports: [MatCheckboxModule,KeyValuePipe],
  templateUrl: './room-settings-component.component.html',
  styleUrl: './mat.scss'
})
export class RoomSettingsComponentComponent {
  switchParticipant(participentSelector:HTMLSelectElement){
    this.patricipentId=participentSelector.selectedIndex+1;
  }
  constructor(private roomsService:RoomSyncService){}
  updatePermission(event: MatCheckboxChange, action:string) {
    let targetPatricipant = this.getParticpant()
    if(!targetPatricipant) return;
    this.roomsService.setPermission(targetPatricipant,action,event.checked)
  }
  @Input() tab: string = '';
  @Input() patricipentId = 1;
  @Input() patricipants: Participant[] = [];
  @Input() me: Participant|undefined;
  getParticpant=()=>this.patricipants.at(this.patricipentId-1);
}
