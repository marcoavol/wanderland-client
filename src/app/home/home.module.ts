import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { MapComponent } from '../map/map.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { PhotoUploadComponent } from '../photo-upload/photo-upload.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ToastsComponent } from '../toasts/toasts.component';

@NgModule({
    declarations: [
        HomePage,
        ToastsComponent,
        MapComponent,
        NavBarComponent,
        PhotoUploadComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild([
            {
                path: '',
                component: HomePage
            }
        ])
    ]
})
export class HomeModule { }
