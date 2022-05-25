import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { takeWhile } from 'rxjs';
import { TrailOptions } from '../../types/settings.types';
import { TrailOptionsService } from './trail-options.service';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.html',
    styleUrls: ['./settings-bar.scss']
})
export class SettingsBarComponent implements OnInit, OnDestroy {

    private isAlive: boolean

    @Output()
    onDisplayedRouteTypesChanged: EventEmitter<TrailOptions> = new EventEmitter()

    public displayedRouteTypeForm = new FormGroup({
        national: new FormControl(true),
        regional: new FormControl(true),
        local: new FormControl(true),
    })

    constructor(
        private offcanvasService: NgbOffcanvas, 
        private trailOptService: TrailOptionsService ) { }

    ngOnInit(): void {
        this.displayedRouteTypesChanged()
        this.isAlive = true
    }

    public displayedRouteTypesChanged(): void {
        this.trailOptService.emitValues(this.displayedRouteTypeForm.value)
    }    

    public open(content: any) {
        this.offcanvasService.open(content);
    }

    ngOnDestroy(): void {
       this.isAlive = false 
    }
}
