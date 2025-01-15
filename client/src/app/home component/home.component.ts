import { Component, output } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CreateRoomComponent } from '../create-room-component/create-room-component.component';
import { Output } from '@angular/core';
import { AsyncPipe } from "@angular/common"
import { RoomSyncService } from '../services/room-sync.service';
import { Room, WatchingRoom } from '../watch-component/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet,RouterLink,CreateRoomComponent, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  items: Promise<Room[]>;
  itemsSearch: typeof this.items;
  constructor(private roomService:RoomSyncService){
    this.items = this.roomService.getRooms();
    this.itemsSearch = this.items;
  }
  title = 'watch2gether';
  menuOpened: boolean = false;
  getRoomsRoute=(id:number)=>'/watchingroom/'+id
  openCloseMenu(){
    this.menuOpened=!this.menuOpened;
  }
  search(content:string){
    if(!content){
      this.itemsSearch = this.items;
      return;
    }
    this.itemsSearch=this.items.then((res)=>res.filter((item)=>item.name.includes(content)))
  }
}
