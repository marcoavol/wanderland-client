import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { RouteOptionsService } from './route-options.service';


@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['./settings-bar.component.scss']
})
export class SettingsBarComponent implements OnInit, OnDestroy, AfterViewInit {

    private isAlive: boolean
    @ViewChild('input') inputElement: ElementRef
   
    public displayedRouteTypeForm = new FormGroup({
        national: new FormControl(true),
        regional: new FormControl(true),
        local: new FormControl(true),
        durationMin: new FormControl(300),
        durationMax: new FormControl(700),
        // elevation: new FormControl(0),
        // descending: new FormControl(0),
        // length: new FormControl(0),
        // fitnessLevel: new FormControl(0),
        // difficulty: new FormControl(0),
    })

    constructor(
        private offcanvasService: NgbOffcanvas, 
        private routeOptService: RouteOptionsService ) { }

    ngOnInit(): void {
        this.displayedRouteTypesChanged()
        this.isAlive = true
    }

    ngAfterViewInit(): void {
        console.log(this.inputElement);
        //(this.inputElement.nativeElement as HTMLElement).innerHTML = "Hello Angular!"
    }

    public displayedRouteTypesChanged(): void {
        this.routeOptService.emitValues(this.displayedRouteTypeForm.value)
        // slider
        const durationMinValue = this.displayedRouteTypeForm.get('durationMin')?.value
        const durationMaxValue = this.displayedRouteTypeForm.get('durationMax')?.value
        //const sliderRangeElement = (this.sliderValueRange.nativeElement as HTMLElement)
        console.log(durationMinValue, durationMaxValue)
        // if (durationMinValue > durationMaxValue) {
        //     sliderRangeElement.style.width = (durationMinValue - durationMaxValue) / 100 + '%'  
        //     sliderRangeElement.style.left = durationMaxValue / 100 + '%'
        // }
        //     inclRange.style.width = (rangeOne.value - rangeTwo.value) / this.getAttribute('max') * 100 + '%';
        //     inclRange.style.left = rangeTwo.value / this.getAttribute('max') * 100 + '%';
        //   } else {
        //     inclRange.style.width = (rangeTwo.value - rangeOne.value) / this.getAttribute('max') * 100 + '%';
        //     inclRange.style.left = rangeOne.value / this.getAttribute('max') * 100 + '%';
        //   }
        
    }    

    public open(content: any) {
        this.offcanvasService.open(content);
    }

    public getIsAlive(): boolean {
        return this.isAlive
    }

 
    ngOnDestroy(): void {
       this.isAlive = false 
    }

}
