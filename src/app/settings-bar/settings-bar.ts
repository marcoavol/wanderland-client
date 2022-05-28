import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { RouteOptionsService } from './route-options.service';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.html',
    styleUrls: ['./settings-bar.scss']
})
export class SettingsBarComponent implements OnInit, OnDestroy {

    private isAlive: boolean

    public displayedRouteTypeForm = new FormGroup({
        national: new FormControl(true),
        regional: new FormControl(true),
        local: new FormControl(true),
        duration: new FormControl(30),
        // elevation: new FormControl(0),
        // descending: new FormControl(0),
        // length: new FormControl(0),
        // fitnessLevel: new FormControl(0),
        // difficulty: new FormControl(0),
    })

    constructor(
        private offcanvasService: NgbOffcanvas, 
        private routeOptService: RouteOptionsService ) { }

    ngOnInit(): void {
        this.displayedRouteTypesChanged()
        this.isAlive = true
    }

    public displayedRouteTypesChanged(): void {
        this.routeOptService.emitValues(this.displayedRouteTypeForm.value)
        console.warn('RouteOptions:', this.displayedRouteTypeForm.value)
    }    

    public open(content: any) {
        this.offcanvasService.open(content);
    }

    public getIsAlive(): boolean {
        return this.isAlive
    }

    ngOnDestroy(): void {
       this.isAlive = false 
    }
}
