import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SettingsBarComponent } from '../settings-bar/settings-bar.component';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import Gemeindeverzeichnis from '../../../assets/gemeindeverzeichnis.json';
import { MapSettingsService } from '../map/map-settings.service';

//TODO connect input to map => zoom or show selected canton
//TODO create a component for the search bar analog to range slider

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

    @ViewChild('searchInput')
    searchInput: ElementRef

    private cantonNames = Gemeindeverzeichnis.KT.map(Gemeindeverzeichnis => Gemeindeverzeichnis.GDEKTNA);

    search = (text$: Observable<string>) =>
        text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 1 
            ? []
            : this.cantonNames.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

    constructor(
        private offcanvasService: NgbOffcanvas,
        private mapSettingsService: MapSettingsService,
    ) { }

    ngOnInit(): void {
        
    }

    public open() {
        this.offcanvasService.open(SettingsBarComponent);
    }

    public searchForCanton(event: Event): void {
        event.preventDefault()   
        const cantonId = this.cantonNames.findIndex(canton => canton === this.searchInput.nativeElement.value)
        console.warn(cantonId, this.searchInput.nativeElement.value)
        this.mapSettingsService.currentSettings.cantonId = cantonId
    }
}


