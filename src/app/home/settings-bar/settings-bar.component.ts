import { Component, OnInit, QueryList, ViewChildren, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MapSettingsService } from '../map/map-settings.service';
import { RangeSliderComponent } from '../range-slider/range-slider.component';
import { takeWhile } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['./settings-bar.component.scss']
})
export class SettingsBarComponent implements OnInit, OnDestroy {

    @ViewChildren(RangeSliderComponent) 
    rangsSliders: QueryList<RangeSliderComponent>;

    public settingsForm: FormGroup

    public rangeSliderMaxValues: { [key: string]: number }

    private isAlive = true

    constructor(
        readonly offcanvas: NgbActiveOffcanvas,
        private mapSettingsService: MapSettingsService,
    ) { }

    ngOnInit(): void {
        const currentSettings = this.mapSettingsService.currentSettings
        this.settingsForm = new FormGroup({
            national: new FormControl(currentSettings.national),
            regional: new FormControl(currentSettings.regional),
            local: new FormControl(currentSettings.local),
            durationMin: new FormControl(currentSettings.durationMin),
            durationMax: new FormControl(currentSettings.durationMax),
            distanceMin: new FormControl(currentSettings.distanceMin),
            distanceMax: new FormControl(currentSettings.distanceMax),
            elevationMin: new FormControl(currentSettings.elevationMin),
            elevationMax: new FormControl(currentSettings.elevationMax),
            descendingMin: new FormControl(currentSettings.descendingMin),
            descendingMax: new FormControl(currentSettings.descendingMax),
            skillsEasy: new FormControl(currentSettings.skillsEasy),
            skillsMedium: new FormControl(currentSettings.skillsMedium),
            skillsHard: new FormControl(currentSettings.skillsHard),
            fitnessEasy: new FormControl(currentSettings.fitnessEasy),
            fitnessMedium: new FormControl(currentSettings.fitnessMedium),
            fitnessHard: new FormControl(currentSettings.fitnessHard),
            includeStages: new FormControl(currentSettings.includeStages),
        })
        this.rangeSliderMaxValues = this.mapSettingsService.getMaxValuesDependingOnIncludeStagesSetting(currentSettings.includeStages)
        this.settingsForm.valueChanges
            .pipe(
                takeWhile(() => this.isAlive), 
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
            )
            .subscribe(settings => {
                this.mapSettingsService.currentSettings = { ...settings }
            })
    }

    public mapSettingsChanged(): void {
        this.mapSettingsService.currentSettings = { ...this.settingsForm.value }
    }

    public handleDurationRangeChange(range: { lower: number, upper: number }): void {
        this.settingsForm.patchValue({ durationMin: range.lower, durationMax: range.upper })
    }

    public handleDistanceRangeChange(range: { lower: number, upper: number }): void {
        this.settingsForm.patchValue({ distanceMin: range.lower, distanceMax: range.upper })
    }

    public handleElevationRangeChange(range: { lower: number, upper: number }): void {
        this.settingsForm.patchValue({ elevationMin: range.lower, elevationMax: range.upper })
    }

    public handleDescendingRangeChange(range: { lower: number, upper: number }): void {
        this.settingsForm.patchValue({ descendingMin: range.lower, descendingMax: range.upper })
    }

    public handleIncludeStagesChange(): void {
        const value = this.settingsForm.value.includeStages
        this.rangeSliderMaxValues = this.mapSettingsService.getMaxValuesDependingOnIncludeStagesSetting(value)
        setTimeout(() => this.rangsSliders.forEach(rangeSlider => rangeSlider.reset()), 0)
        this.settingsForm.reset({ ...this.mapSettingsService.DEFAULT_SETTINGS, ...this.rangeSliderMaxValues, includeStages: value })
    } 

    public resetFiltersToDefault(): void {
        this.rangsSliders.forEach(rangeSlider => rangeSlider.reset())
        this.settingsForm.reset({...this.mapSettingsService.DEFAULT_SETTINGS})
    }

    ngOnDestroy(): void {
        this.isAlive = false
    }
}