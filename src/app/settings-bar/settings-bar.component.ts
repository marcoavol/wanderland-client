import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MapSettingsService } from '../map/map-settings.service';
import { units } from '../types/settings.types';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['./settings-bar.component.scss']
})
export class SettingsBarComponent implements OnInit {

    public mapSettingsForm: FormGroup
    public durationUnit: units
    public elevationUnit: units
    public descendingUnit: units
    public lengthUnit: units

    constructor(
        readonly offcanvas: NgbActiveOffcanvas,
        private mapSettingsService: MapSettingsService,
    ) { }

    ngOnInit(): void {
        this.durationUnit = 'DaysHoursMinutes'
        this.elevationUnit = 'Meters'
        this.descendingUnit = 'Meters'
        this.lengthUnit = 'Kilometers'

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
            lengthMin: new FormControl(currentSettings.lengthMin),
            lengthMax: new FormControl(currentSettings.lengthMax),
            easy: new FormControl(currentSettings.easy),
            medium: new FormControl(currentSettings.medium),
            hard: new FormControl(currentSettings.hard),
            lowFitness: new FormControl(currentSettings.lowFitness),
            mediumFitness: new FormControl(currentSettings.mediumFitness),
            goodFitness: new FormControl(currentSettings.goodFitness),
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

    public handleDescendingRangeChange(range: { lower: number, upper: number }): void {
        this.mapSettingsForm.patchValue({ descendingMin: range.lower, descendingMax: range.upper })
    }

    public handleLengthRangeChange(range: { lower: number, upper: number }): void {
        this.mapSettingsForm.patchValue({ lengthMin: range.lower, lengthMax: range.upper })
    }
}
