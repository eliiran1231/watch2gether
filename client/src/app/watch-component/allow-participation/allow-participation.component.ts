import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-allow-participation',
  standalone: true,
  imports: [],
  templateUrl: './allow-participation.component.html',
  styleUrl: '../../general-menu.css'
})
export class AllowParticipationComponent {
  @Output() allowed = new EventEmitter<boolean>();
}
