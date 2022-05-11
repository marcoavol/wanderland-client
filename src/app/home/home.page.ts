import { Component, OnInit } from '@angular/core';

@Component({
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {

    public displayedRouteTypes: { national: boolean, regional: boolean, local: boolean }

    constructor() { }

    ngOnInit(): void {
        
    }

}
