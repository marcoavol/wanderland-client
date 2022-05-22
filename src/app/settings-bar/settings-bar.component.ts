import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { RouteOptions } from '../../types/settings.types';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['./settings-bar.component.scss']
})
export class SettingsBarComponent implements OnInit {

    @Output()
    onDisplayedRouteTypesChanged: EventEmitter<RouteOptions> = new EventEmitter()

    public displayedRouteTypeForm = new FormGroup({
        national: new FormControl(true),
        regional: new FormControl(true),
        local: new FormControl(true),
    })

    constructor(private offcanvasService: NgbOffcanvas) { }

    ngOnInit(): void {
        this.displayedRouteTypesChanged()
    }

    public displayedRouteTypesChanged(): void {
        this.onDisplayedRouteTypesChanged.emit(this.displayedRouteTypeForm.value)
    }

    public open(content: any) {
        this.offcanvasService.open(content);
    }

}
