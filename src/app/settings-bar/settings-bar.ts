import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { RouteOptions } from '../../types/settings.types';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.html',
    styleUrls: ['./settings-bar.scss']
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

    public getValues(): any {
        const obs = new Observable(observer => {
            setTimeout(() => {
                observer.next(1);
            }, 2000);
        });
    }

}
