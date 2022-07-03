import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SettingsBarComponent } from '../settings-bar/settings-bar.component';
import { Observable, takeWhile } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import Gemeindeverzeichnis from '../../../assets/gemeindeverzeichnis.json';
import { MapSettingsService } from '../map/map-settings.service';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {

    @ViewChild('searchInput')
    searchInput: ElementRef

    public search = (text$: Observable<string>) => text$.pipe(
        takeWhile(() => this.isAlive),
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 1 
            ? []
            : this.cantonNamesAndIDs.filter(item => item.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
     )

    public formatter = (item: { name: string, id: number }) => item.name

    private cantonNamesAndIDs = Gemeindeverzeichnis.KT.map(canton => ({ name: canton.GDEKTNA, id: canton.KTNR }))

    private isAlive = true

    constructor(
        private offcanvasService: NgbOffcanvas,
        private mapSettingsService: MapSettingsService,
    ) { }

    ngOnInit(): void {
        this.mapSettingsService.mapSettingsObservable.pipe(takeWhile(() => this.isAlive)).subscribe(_ => {
            if (this.mapSettingsService.currentSettings.cantonId == undefined && this.searchInput) {
                this.resetSearchInput()
            }
        })
    }

    public open() {
        this.offcanvasService.open(SettingsBarComponent);
        this.mapSettingsService.currentSettings = { cantonId: undefined }
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

    public resetSearchInput(): void {
        this.searchInput.nativeElement.value = ""
    }

    ngOnDestroy(): void {
        this.isAlive = false
    }
}


