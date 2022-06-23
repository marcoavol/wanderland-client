import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { MapComponent } from './map/map.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { SettingsBarComponent } from './settings-bar/settings-bar.component';
import { PhotoUploadComponent } from './photo-upload/photo-upload.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { RangeSliderComponent } from './range-slider/range-slider.component';
import { PhotoCarouselComponent } from './photo-carousel/photo-carousel.component';
import { UtilsModule } from '../utils/utils.module';

@NgModule({
    declarations: [
        HomePage,
        MapComponent,
        NavBarComponent,
        SettingsBarComponent,
        PhotoUploadComponent,
        RangeSliderComponent,
        PhotoCarouselComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgbModule,
        UtilsModule,
        RouterModule.forChild([
            {
                path: '',
                component: HomePage
            }
        ])
    ]
})
export class HomeModule { }
