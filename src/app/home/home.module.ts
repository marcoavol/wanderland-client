import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { MapComponent } from '../map/map.component';
import { NavBarComponent } from '../nav-bar/nav-bar.coponent';
import { SettingsBarComponent } from '../settings-bar/settings-bar.component';
import { PhotoUploadComponent } from '../photo-upload/photo-upload.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastsComponent } from '../toasts/toasts.component';
import { RangeSliderComponent } from '../range-slider/range-slider.component';

@NgModule({
    declarations: [
        HomePage,
        ToastsComponent,
        MapComponent,
        NavBarComponent,
        SettingsBarComponent,
        PhotoUploadComponent,
        RangeSliderComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
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
