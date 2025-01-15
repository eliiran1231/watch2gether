// page-exists.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RoomSyncService } from './room-sync.service';  // A service that checks if the page exists

@Injectable({
  providedIn: 'root',
})
export class PageExistsGuardService implements CanActivate {
  constructor(private roomService: RoomSyncService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const id = Number(route.paramMap.get('id'))||0;
    return this.roomService.getRoom(id).then(res=>true).catch(err=>{
      this.router.navigate(['/404']);
      return false;
    })
  }
}
