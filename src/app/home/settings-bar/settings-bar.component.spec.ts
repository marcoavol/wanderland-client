import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SettingsBarComponent } from './settings-bar.component';
import { MapSettingsService } from '../map/map-settings.service';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { RangeSliderComponent } from '../range-slider/range-slider.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('SettingsBarComponent', () => {

    let component: SettingsBarComponent
    let fixture: ComponentFixture<SettingsBarComponent>
    let mapSettingsService: MapSettingsService

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SettingsBarComponent, RangeSliderComponent],
            imports: [ReactiveFormsModule],
            providers: [NgbActiveOffcanvas]
        }).compileComponents();
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsBarComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        mapSettingsService = TestBed.inject(MapSettingsService)
        mapSettingsService.currentSettings = { ...mapSettingsService['DEFAULT_SETTINGS'] }
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
        expect(mapSettingsService).toBeTruthy()
    })

    it('should determine if reset filters works', () => {
        expect(mapSettingsService.currentSettings.durationMin).toBe(mapSettingsService['DEFAULT_SETTINGS'].durationMin)
        expect(mapSettingsService.currentSettings.durationMax).toBe(mapSettingsService['DEFAULT_SETTINGS'].durationMax)
        expect(mapSettingsService.currentSettings.descendingMin).toBe(mapSettingsService['DEFAULT_SETTINGS'].descendingMin)
        expect(mapSettingsService.currentSettings.descendingMax).toBe(mapSettingsService['DEFAULT_SETTINGS'].descendingMax)
        component.handleDurationRangeChange( {lower: 25, upper:600} )
        component.handleDescendingRangeChange( {lower: 500, upper: 2100} )
        expect(mapSettingsService.currentSettings.durationMin).toBeGreaterThan(mapSettingsService['DEFAULT_SETTINGS'].durationMin)
        expect(mapSettingsService.currentSettings.durationMax).toBeLessThan(mapSettingsService['DEFAULT_SETTINGS'].durationMax)
        expect(mapSettingsService.currentSettings.descendingMin).toBeGreaterThan(mapSettingsService['DEFAULT_SETTINGS'].descendingMin)
        expect(mapSettingsService.currentSettings.descendingMax).toBeLessThan(mapSettingsService['DEFAULT_SETTINGS'].descendingMax)
        component.resetFiltersToDefault()
        expect(mapSettingsService.currentSettings).toEqual(mapSettingsService['DEFAULT_SETTINGS'])
        
        expect(mapSettingsService.currentSettings.regional).toBeTrue()
        expect(mapSettingsService.currentSettings.national).toBeTrue()
        expect(mapSettingsService.currentSettings.skillsHard).toBeTrue()
        expect(mapSettingsService.currentSettings.fitnessMedium).toBeTrue()
        component.settingsForm.value.regional = false
        component.settingsForm.value.national = false
        component.settingsForm.value.skillsHard = false
        component.settingsForm.value.fitnessMedium = false
        component.mapSettingsChanged()
        expect(mapSettingsService.currentSettings.regional).toBeFalse()
        expect(mapSettingsService.currentSettings.national).toBeFalse()
        expect(mapSettingsService.currentSettings.skillsHard).toBeFalse()
        expect(mapSettingsService.currentSettings.fitnessMedium).toBeFalse()
        component.resetFiltersToDefault()
        expect(mapSettingsService.currentSettings).toEqual(mapSettingsService['DEFAULT_SETTINGS'])
    })

    it('should determine the toggle switch stages/routes', () => {
        expect(mapSettingsService.currentSettings.includeStages).toBeTrue()
        expect(mapSettingsService.currentSettings.durationMax).toBe(mapSettingsService['DEFAULT_SETTINGS'].durationMax)
        expect(mapSettingsService.currentSettings.distanceMax).toBe(mapSettingsService['DEFAULT_SETTINGS'].distanceMax)
        expect(mapSettingsService.currentSettings.elevationMax).toBe(mapSettingsService['DEFAULT_SETTINGS'].elevationMax)
        expect(mapSettingsService.currentSettings.descendingMax).toBe(mapSettingsService['DEFAULT_SETTINGS'].descendingMax)
        component.settingsForm.value.includeStages = false
        component.handleIncludeStagesChange()
        expect(mapSettingsService.currentSettings.includeStages).toBeFalse()
        expect(mapSettingsService.currentSettings.durationMax).toBe(17280)
        expect(mapSettingsService.currentSettings.distanceMax).toBe(700000)
        expect(mapSettingsService.currentSettings.elevationMax).toBe(50000)
        expect(mapSettingsService.currentSettings.descendingMax).toBe(50000)
        component.resetFiltersToDefault()
        expect(mapSettingsService.currentSettings).toEqual(mapSettingsService['DEFAULT_SETTINGS'])
    })

});