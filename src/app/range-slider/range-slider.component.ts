import { Component, ViewChild, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss']
})
export class RangeSliderComponent implements OnInit {

    @ViewChild('outMinValue')
    outMinValue: ElementRef
    @ViewChild('outMaxValue')
    outMaxValue: ElementRef
    @ViewChild('spanFullRange')
    spanFullRange: ElementRef
    @ViewChild('spanSliderRange')
    spanSliderRange: ElementRef
    @ViewChild('rangeMin')
    rangeMin: ElementRef
    @ViewChild('rangeMax')
    rangeMax: ElementRef

    @Input()
    min: number

    @Input()
    max: number

    @Output()
    onLowerChanged = new EventEmitter<number>()

    @Output()
    onUpperChanged = new EventEmitter<number>()

    private viewInitDone: boolean


  constructor() { }

  ngOnInit(): void {
    this.viewInitDone = false
}

ngAfterViewInit(): void {
    this.viewInitDone = true
    this.updateTwoRangeSlider()
}

  private updateTwoRangeSlider(): void {

    const minValue = parseFloat((this.rangeMin.nativeElement as HTMLInputElement).value)
    const maxValue = parseFloat((this.rangeMax.nativeElement as HTMLInputElement).value)
    
    if (this.viewInitDone) {
        const spanSliderRangeElement = (this.spanSliderRange.nativeElement as HTMLElement)
        const maxSliderValue: any = (this.rangeMin.nativeElement as HTMLElement).getAttribute("max")

        if (maxSliderValue != null) {
            if (minValue < maxValue) {
                spanSliderRangeElement.style.width = (maxValue - minValue) / maxSliderValue * 100 + '%';
                spanSliderRangeElement.style.left = minValue / maxSliderValue * 100 + '%';
            } else {
                spanSliderRangeElement.style.width = 0 + '%';
                spanSliderRangeElement.style.left = 0 + '%';
            }

            this.outMinValue.nativeElement.innerHTML = minValue
            this.outMinValue.nativeElement.style.left = minValue / maxSliderValue * 100 + '%'

            this.outMaxValue.nativeElement.innerHTML = maxValue
            this.outMaxValue.nativeElement.style.left = maxValue / maxSliderValue * 100 + '%'
        
        }
        this.onLowerChanged.emit(minValue)
        this.onUpperChanged.emit(maxValue)
    }
  }
}
