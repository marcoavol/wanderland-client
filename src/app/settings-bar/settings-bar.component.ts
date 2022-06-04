import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MapSettingsService } from '../map/map-settings.service';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['./settings-bar.component.scss']
})
export class SettingsBarComponent implements OnInit {

    public mapSettingsForm: FormGroup

    constructor(
        readonly offcanvas: NgbActiveOffcanvas,
        private mapSettingsService: MapSettingsService,
    ) { }

    ngOnInit(): void {
        const currentSettings = this.mapSettingsService.currentSettings
        this.mapSettingsForm = new FormGroup({
            national: new FormControl(currentSettings.national),
            regional: new FormControl(currentSettings.regional),
            local: new FormControl(currentSettings.local),
            durationMin: new FormControl(currentSettings.durationMin),
            durationMax: new FormControl(currentSettings.durationMax),
            elevationMin: new FormControl(currentSettings.elevationMin),
            elevationMax: new FormControl(currentSettings.elevationMax),
            descendingMin: new FormControl(currentSettings.descendingMin),
            descendingMax: new FormControl(currentSettings.descendingMax),
            // elevation: new FormControl(0),
            // descending: new FormControl(0),
            // length: new FormControl(0),
            // fitnessLevel: new FormControl(0),
            // difficulty: new FormControl(0),
        })
        this.mapSettingsChanged()
    }

    public mapSettingsChanged(): void {
        this.mapSettingsService.currentSettings = this.mapSettingsForm.value
    }

    public handleDurationRangeChange(range: { lower: number, upper: number }): void {
        this.mapSettingsForm.patchValue({ durationMin: range.lower, durationMax: range.upper })
    }

    public handleElevationRangeChange(range: { lower: number, upper: number }): void {
        this.mapSettingsForm.patchValue({ elevationMin: range.lower, elevationMax: range.upper })
    }

}
