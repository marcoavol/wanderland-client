import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SettingsBarComponent } from '../settings-bar/settings-bar.component';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import Gemeindeverzeichnis from '../../assets/gemeindeverzeichnis.json';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

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
    ) { }

    ngOnInit(): void {
        
    }

    public open() {
        this.offcanvasService.open(SettingsBarComponent);
    }
}


