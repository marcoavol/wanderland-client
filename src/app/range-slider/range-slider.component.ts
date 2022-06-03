import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';


@Component({
    selector: 'app-range-slider',
    templateUrl: './range-slider.component.html',
    styleUrls: ['./range-slider.component.scss']
})
export class RangeSliderComponent implements OnInit, AfterViewInit {

    @ViewChild('outMinValue')
    outMinValue: ElementRef
    @ViewChild('outMaxValue')
    outMaxValue: ElementRef
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

    @Output()
    onRangeChanged = new EventEmitter<{ lower: number, upper: number }>()

    public rangeForm: FormGroup

    constructor() { }

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

        this.outMinValue.nativeElement.innerHTML = lowerValue
        this.outMinValue.nativeElement.style.left = lowerValue / this.max * 100 + '%'

        this.outMaxValue.nativeElement.innerHTML = upperValue
        this.outMaxValue.nativeElement.style.left = upperValue / this.max * 100 + '%'
    }

}
