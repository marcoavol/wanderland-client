import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MapSettingsService } from '../map/map-settings.service';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['./settings-bar.component.scss']
})
export class SettingsBarComponent implements OnInit, AfterViewInit {

    @ViewChild('spanFullRange')
    spanFullRange: ElementRef
    @ViewChild('spanSliderRange')
    spanSliderRange: ElementRef
    @ViewChild('rangeDurationMin')
    rangeDurationMin: ElementRef
    @ViewChild('rangeDurationMax')
    rangeDurationMax: ElementRef

    private sliderMinGap: number

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
        console.log(this.rangeDurationMin.nativeElement)
        console.log(this.rangeDurationMax.nativeElement)
        this.viewInitDone = true
    }

    public mapSettingsChanged(): void {
        this.mapSettingsService.currentSettings = this.mapSettingsForm.value
        
        const durationMinValue = this.mapSettingsForm.get('durationMin')?.value
        const durationMaxValue = this.mapSettingsForm.get('durationMax')?.value
        // const rangeDurationMinElement = (this.rangeDurationMin.nativeElement as HTMLElement)
        // const rangeDurationMaxElement = (this.rangeDurationMax.nativeElement as HTMLElement)

        if (this.viewInitDone) {
            console.log(durationMinValue, durationMaxValue);
            
            (this.spanSliderRange.nativeElement as HTMLElement).style.width = (durationMaxValue - durationMinValue) / 100 * 100 + '%';
            (this.spanSliderRange.nativeElement as HTMLElement).style.left = durationMinValue / 100 * 100 + '%';
            
        }
      
        //     inclRange.style.width = (rangeOne.value - rangeTwo.value) / this.getAttribute('max') * 100 + '%';
        //     inclRange.style.left = rangeTwo.value / this.getAttribute('max') * 100 + '%';
        //   } else {
        //     inclRange.style.width = (rangeTwo.value - rangeOne.value) / this.getAttribute('max') * 100 + '%';
        //     inclRange.style.left = rangeOne.value / this.getAttribute('max') * 100 + '%';
        //   }
        
    }

}
