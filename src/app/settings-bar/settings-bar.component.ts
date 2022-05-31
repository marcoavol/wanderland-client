import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { max } from 'd3';
import { MapSettingsService } from '../map/map-settings.service';

// TODO: stop sliderMin from going over sliderMax => use minGap between

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['./settings-bar.component.scss']
})
export class SettingsBarComponent implements OnInit, AfterViewInit {

    @ViewChild('outMinValue')
    outMinValue: ElementRef
    @ViewChild('outMaxValue')
    outMaxValue: ElementRef
    @ViewChild('spanFullRange')
    spanFullRange: ElementRef
    @ViewChild('spanSliderRange')
    spanSliderRange: ElementRef
    @ViewChild('rangeDurationMin')
    rangeDurationMin: ElementRef
    @ViewChild('rangeDurationMax')
    rangeDurationMax: ElementRef

    private viewInitDone: boolean

    public mapSettingsForm: FormGroup

    constructor(
        readonly offcanvas: NgbActiveOffcanvas,
        private mapSettingsService: MapSettingsService,
    ) { }

    ngOnInit(): void {
        this.viewInitDone = false
        const currentSettings = this.mapSettingsService.currentSettings
        this.mapSettingsForm = new FormGroup({
            national: new FormControl(currentSettings.national),
            regional: new FormControl(currentSettings.regional),
            local: new FormControl(currentSettings.local),
            durationMin: new FormControl(currentSettings.durationMin),
            durationMax: new FormControl(currentSettings.durationMax),
            // elevation: new FormControl(0),
            // descending: new FormControl(0),
            // length: new FormControl(0),
            // fitnessLevel: new FormControl(0),
            // difficulty: new FormControl(0),
        })
        this.mapSettingsChanged()
    }

    ngAfterViewInit(): void {
        this.viewInitDone = true
    }

    public mapSettingsChanged(): void {
        this.mapSettingsService.currentSettings = this.mapSettingsForm.value
        
        const durationMinValue = this.mapSettingsForm.get('durationMin')?.value
        const durationMaxValue = this.mapSettingsForm.get('durationMax')?.value

        if (this.viewInitDone) {
            console.log(durationMinValue, durationMaxValue);
            const spanSliderRangeElement = (this.spanSliderRange.nativeElement as HTMLElement)
            const maxSliderValue: any = (this.rangeDurationMin.nativeElement as HTMLElement).getAttribute("max")

            if (maxSliderValue != null) {
                if (durationMinValue < durationMaxValue) {
                    spanSliderRangeElement.style.width = (durationMaxValue - durationMinValue) / maxSliderValue * 100 + '%';
                    spanSliderRangeElement.style.left = durationMinValue / maxSliderValue * 100 + '%';
                } else {
                    spanSliderRangeElement.style.width = 0 + '%';
                    spanSliderRangeElement.style.left = 0 + '%';
                }

                this.outMinValue.nativeElement.innerHTML = durationMinValue
                this.outMinValue.nativeElement.style.left = durationMinValue / maxSliderValue * 100 + '%'

                this.outMaxValue.nativeElement.innerHTML = durationMaxValue
                this.outMaxValue.nativeElement.style.left = durationMaxValue / maxSliderValue * 100 + '%'
            }
        }
    }

}
