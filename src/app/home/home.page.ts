import { Component, OnInit } from '@angular/core';
import { MapSettings } from '../types/settings.types';

@Component({
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {

    public displayedRouteTypes: MapSettings

    constructor() { }

    ngOnInit(): void {
        
    }

}
