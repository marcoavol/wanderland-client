import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SettingsBarComponent } from '../settings-bar/settings-bar.component';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

    constructor(
        private offcanvasService: NgbOffcanvas,
    ) { }

    ngOnInit(): void {
  
    }

    public open() {
        this.offcanvasService.open(SettingsBarComponent);
    }

}


