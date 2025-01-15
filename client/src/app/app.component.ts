import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from "./home component/home.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent],
  template: `
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title = 'watch2gether';
  items = [1,2,3,4,5,6,7,8,9,0,8,7,5,9].map((e,i)=>{
    return {roomName:("room"+i)}
  })
}
