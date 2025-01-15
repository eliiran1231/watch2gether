import { Component, EventEmitter, Output } from '@angular/core';
import { RoomSyncService } from '../services/room-sync.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-room',
  standalone: true,
  templateUrl: './create-room-component.component.html',
  styleUrls: ['../general-menu.css'],
  imports: [FormsModule]
})
export class CreateRoomComponent {
  @Output() roomEvent = new EventEmitter<boolean>(); 
  srcOptions = ["url", "file", "youtube"];
  selectedSrcOption = this.srcOptions[0];
  videoSrc: string | undefined;
  roomName: string | undefined;
  nickname: string | undefined;
  uploadProgress = -1;
  constructor(private roomService:RoomSyncService) {}
  async load(url:string | undefined){
    if(this.selectedSrcOption == "file"){
      const formData = new FormData();
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput?.files?.length) {
        formData.append('video', fileInput.files[0]);
        this.roomService.uploadVideo(formData).subscribe({
          next: (result) => {
            if (result.url) {
              this.videoSrc = result.url;  // Set the URL after successful upload
              console.warn(this.videoSrc);
            } else {
              this.uploadProgress = result.progress;  // Update progress
            }
          },
          error: (err) => {
            console.error('Error uploading file', err);
          }
        });
      }
    }
    else this.videoSrc = url||"error";
  }
  async onSubmit() {
    if(!(this.videoSrc && this.roomName && this.nickname)) throw new Error("fields are missing")
    this.roomService.createRoom(this.videoSrc,this.roomName,this.nickname);
  }
}
