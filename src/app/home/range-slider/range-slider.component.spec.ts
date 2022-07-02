import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RangeSliderComponent } from '../range-slider/range-slider.component';
import { MapSettingsService } from '../map/map-settings.service';
import { ReactiveFormsModule } from '@angular/forms';

fdescribe('RangeSliderComponent', () => {

    let component: RangeSliderComponent
    let fixture: ComponentFixture<RangeSliderComponent>
    let mapSettingsService: MapSettingsService

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [RangeSliderComponent],
            imports: [ReactiveFormsModule],
        }).compileComponents();
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(RangeSliderComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        mapSettingsService = TestBed.inject(MapSettingsService)
        mapSettingsService.currentSettings = { ...mapSettingsService['DEFAULT_SETTINGS'] }
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
        expect(mapSettingsService).toBeTruthy()
    })

    // it('should test correct display of values', () => {
        
    // })

});