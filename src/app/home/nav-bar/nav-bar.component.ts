import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgbOffcanvas, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
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
export class NavBarComponent {

    @ViewChild('searchInput')
    searchInput: ElementRef

    public search = (text$: Observable<string>) => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 1 
            ? []
            : this.cantonNamesAndIDs.filter(item => item.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
     )

    public formatter = (item: { name: string, id: number }) => item.name

    private cantonNamesAndIDs = Gemeindeverzeichnis.KT.map(canton => ({ name: canton.GDEKTNA, id: canton.KTNR }))

    constructor(
        private offcanvasService: NgbOffcanvas,
        private mapSettingsService: MapSettingsService,
    ) { }

    public open() {
        this.offcanvasService.open(SettingsBarComponent);
    }

    public searchByName(event: Event): void {
        event.preventDefault()
        const name = this.searchInput.nativeElement.value
        const id = this.cantonNamesAndIDs.find(canton => canton.name === name)?.id
        this.searchById(id)
    }

    public searchById(id?: number): void {
        this.mapSettingsService.currentSettings = { cantonId: id }
    }

}


