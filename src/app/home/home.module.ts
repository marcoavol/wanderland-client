import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { MapComponent } from '../map/map.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PhotoUploadComponent } from '../photo-upload/photo-upload.component';

@NgModule({
    declarations: [
        HomePage,
        MapComponent,
        NavBarComponent,
        PhotoUploadComponent,
    ],
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule.forChild([
            {
                path: '',
                component: HomePage
            }
        ])
    ]
})
export class HomeModule { }
