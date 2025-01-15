import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomSyncService } from '../../services/room-sync.service';
import { Participant } from '../types';

@Component({
  selector: 'app-create-nickname',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-nickname.component.html',
  styleUrl: "../../general-menu.css"
})
export class CreateNicknameComponent {
  constructor(private roomService:RoomSyncService){}
  nickname: string = '';
  @Input() roomId = 0;
  @Output() participantAdded = new EventEmitter<Participant>();
  async onSubmit() {
    let participant = await this.roomService.registerToRoom(this.roomId,this.nickname) as Participant;
    this.participantAdded.emit(participant);
  }
}
