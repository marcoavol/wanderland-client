import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Unit } from '../../types/settings.types';
import { UnitUtilsService } from '../../utils/unit-utils.service';

@Component({
    selector: 'app-range-slider',
    templateUrl: './range-slider.component.html',
    styleUrls: ['./range-slider.component.scss']
})
export class RangeSliderComponent implements OnInit, AfterViewInit {

    @ViewChild('lowerValueLabel')
    lowerValueLabel: ElementRef
    @ViewChild('upperValueLabel')
    upperValueLabel: ElementRef
    @ViewChild('selectedRange')
    selectedRange: ElementRef

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
    unit: Unit

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
        this.updateSelectedRange(lowerValue, upperValue)
        this.updateValueLabels(lowerValue, upperValue)
    }

    private updateSelectedRange(lowerValue: number, upperValue: number): void {
        const selectedRangeElement = (this.selectedRange.nativeElement as HTMLElement)
        if (lowerValue < upperValue) {
            selectedRangeElement.style.width = (upperValue - lowerValue) / this.max * 100 + '%';
            selectedRangeElement.style.left = lowerValue / this.max * 100 + '%';
        } else {
            selectedRangeElement.style.width = 0 + '%';
            selectedRangeElement.style.left = 0 + '%';
        }
    }

    private resetSelectedRange(): void {
        const selectedRangeElement = (this.selectedRange.nativeElement as HTMLElement)
        selectedRangeElement.style.width = '100%'
        selectedRangeElement.style.left = '0%'
    }

    private updateValueLabels(lowerValue: number, upperValue: number): void {
        const lowerValueLabelElement = this.lowerValueLabel.nativeElement as HTMLElement
        const upperValueLabelElement = this.upperValueLabel.nativeElement as HTMLElement

        lowerValueLabelElement.innerHTML = this.unitUtilsService.convertToUnitString(lowerValue, this.unit)

        if (lowerValue <= this.max / 2) {
            lowerValueLabelElement.style.right = 'unset'
            lowerValueLabelElement.style.left = lowerValue / this.max * 100 + '%'
        } else {
            lowerValueLabelElement.style.left = 'unset'
            lowerValueLabelElement.style.right = 100 - (lowerValue / this.max * 100) + '%'
        }

        if (upperValue > this.max / 2) {
            upperValueLabelElement.style.left = 'unset'
            upperValueLabelElement.style.right = 100 - (upperValue / this.max * 100) + '%'
        } else {
            upperValueLabelElement.style.right = 'unset'
            upperValueLabelElement.style.left = upperValue / this.max * 100 + '%'
        }

        const distanceBetweenValueLabels = this.selectedRange.nativeElement.offsetWidth -
            lowerValueLabelElement.offsetWidth -
            upperValueLabelElement.offsetWidth

        if (distanceBetweenValueLabels <= 25) {
            upperValueLabelElement.style.visibility = 'hidden'
            lowerValueLabelElement.innerHTML = this.unitUtilsService.convertToUnitString(lowerValue, this.unit) + " - " +
                this.unitUtilsService.convertToUnitString(upperValue, this.unit)
        } else {
            upperValueLabelElement.style.visibility = 'visible'
            upperValueLabelElement.innerHTML = this.unitUtilsService.convertToUnitString(upperValue, this.unit)
        }
    }

    public reset(): void {
        this.rangeForm.reset({ limitOne: this.min, limitTwo: this.max })
        this.resetSelectedRange()
        this.updateValueLabels(this.min, this.max)
    }

}
