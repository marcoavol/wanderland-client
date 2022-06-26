import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MapSettingsService } from '../map/map-settings.service';
import { Unit } from '../../types/settings.types';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['./settings-bar.component.scss']
})
export class SettingsBarComponent implements OnInit {

    public mapSettingsForm: FormGroup
    public durationUnit: Unit
    public elevationUnit: Unit
    public lengthUnit: Unit

    constructor(
        readonly offcanvas: NgbActiveOffcanvas,
        private mapSettingsService: MapSettingsService,
    ) { }

    ngOnInit(): void {
        this.durationUnit = 'DaysHoursMinutes'
        this.elevationUnit = 'Meters'
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
            distanceMin: new FormControl(currentSettings.distanceMin),
            distanceMax: new FormControl(currentSettings.distanceMax),
            skillsEasy: new FormControl(currentSettings.skillsEasy),
            skillsMedium: new FormControl(currentSettings.skillsMedium),
            skillsHard: new FormControl(currentSettings.skillsHard),
            fitnessEasy: new FormControl(currentSettings.fitnessEasy),
            fitnessMedium: new FormControl(currentSettings.fitnessMedium),
            fitnessHard: new FormControl(currentSettings.fitnessHard),
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

    public handleLengthRangeChange(range: { lower: number, upper: number }): void {
        this.mapSettingsForm.patchValue({ distanceMin: range.lower, distanceMax: range.upper })
    }
}
