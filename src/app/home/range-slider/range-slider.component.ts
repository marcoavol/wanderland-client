import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { units } from '../../types/settings.types';
import { UnitUtilsService } from '../../utils/unit-utils.service';

@Component({
    selector: 'app-range-slider',
    templateUrl: './range-slider.component.html',
    styleUrls: ['./range-slider.component.scss']
})
export class RangeSliderComponent implements OnInit, AfterViewInit {

    @ViewChild('lowerValueOutput')
    lowerValueOutput: ElementRef
    @ViewChild('upperValueOutput')
    upperValueOutput: ElementRef
    @ViewChild('spanFullRange')
    spanFullRange: ElementRef
    @ViewChild('spanSliderRange')
    spanSliderRange: ElementRef

    @Input()
    min: number

    @Input()
    max: number

    @Input()
    step: number

    @Input()
    initialLower: number

    @Input()
    initialUpper: number

    @Input()
    unit: units

    @Output()
    onRangeChanged = new EventEmitter<{ lower: number, upper: number }>()

    public rangeForm: FormGroup

    constructor(
        private unitUtilsService: UnitUtilsService
    ) { }

    ngOnInit(): void {
        this.rangeForm = new FormGroup({
            limitOne: new FormControl(this.initialLower),
            limitTwo: new FormControl(this.initialUpper)
        })
    }

    ngAfterViewInit(): void {
        this.rangeSliderChanged()
    }

    public rangeSliderChanged(): void {
        const lowerValue = Math.min(this.rangeForm.value.limitOne, this.rangeForm.value.limitTwo)
        const upperValue = Math.max(this.rangeForm.value.limitOne, this.rangeForm.value.limitTwo)

        this.onRangeChanged.emit({ lower: lowerValue, upper: upperValue })

        const spanSliderRangeElement = (this.spanSliderRange.nativeElement as HTMLElement)
      
        if (lowerValue < upperValue) {
            spanSliderRangeElement.style.width = (upperValue - lowerValue) / this.max * 100 + '%';
            spanSliderRangeElement.style.left = lowerValue / this.max * 100 + '%';
        } else {
            spanSliderRangeElement.style.width = 0 + '%';
            spanSliderRangeElement.style.left = 0 + '%';
        }

        this.showOutputValues(lowerValue, upperValue)
    }

    private showOutputValues(lowerValue: number, upperValue: number): void {

        this.lowerValueOutput.nativeElement.innerHTML = this.unitUtilsService.convertToUnitString(lowerValue, this.unit)
        if (lowerValue <= this.max / 2) {
            this.lowerValueOutput.nativeElement.style.right = 'unset'
            this.lowerValueOutput.nativeElement.style.left = lowerValue / this.max * 100 + '%'
        } else {
            this.lowerValueOutput.nativeElement.style.left = 'unset'
            this.lowerValueOutput.nativeElement.style.right = 100 - (lowerValue / this.max * 100) + '%'
        }
        
        if (upperValue > this.max / 2) {
            this.upperValueOutput.nativeElement.style.left = 'unset'
            this.upperValueOutput.nativeElement.style.right = 100 - (upperValue / this.max * 100) + '%'
        } else {
            this.upperValueOutput.nativeElement.style.right = 'unset'
            this.upperValueOutput.nativeElement.style.left = upperValue / this.max * 100 + '%'
        }

        const distanceBetweenOutputs = this.spanSliderRange.nativeElement.offsetWidth - 
                                        this.lowerValueOutput.nativeElement.offsetWidth - 
                                        this.upperValueOutput.nativeElement.offsetWidth
        
        if (distanceBetweenOutputs <= 25) {
            this.upperValueOutput.nativeElement.style.visibility = 'hidden'
            this.lowerValueOutput.nativeElement.innerHTML = this.unitUtilsService.convertToUnitString(lowerValue, this.unit) + " - " + 
                                                            this.unitUtilsService.convertToUnitString(upperValue, this.unit)
        } else {
            this.upperValueOutput.nativeElement.style.visibility = 'visible'
            this.upperValueOutput.nativeElement.innerHTML = this.unitUtilsService.convertToUnitString(upperValue, this.unit)
        }
    }
}
