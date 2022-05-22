import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

    @Output()
    onDisplayedRouteTypesChanged: EventEmitter<{ national: boolean, regional: boolean, local: boolean }> = new EventEmitter()

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
