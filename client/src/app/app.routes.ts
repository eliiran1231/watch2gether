import { Routes } from '@angular/router';
import { HomeComponent } from './home component/home.component';
import { WatchComponent } from './watch-component/watch-component.component';
import { PageExistsGuardService } from './services/page-exists-guard.service';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
    {
        path:'',
        component:HomeComponent
    },
    {
        path:'watchingroom/:id',
        canActivate: [PageExistsGuardService],
        component:WatchComponent
    },
    {
        path:'404',
        component:NotFoundComponent
    }
];
