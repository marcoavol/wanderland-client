import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavBarComponent } from './nav-bar.component';
import { MapSettingsService } from '../map/map-settings.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

fdescribe('NavBarComponent', () => {

    let component: NavBarComponent
    let fixture: ComponentFixture<NavBarComponent>
    let mapSettingsService: MapSettingsService

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NavBarComponent],
            imports: [NgbTypeaheadModule],  
        }).compileComponents();       
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(NavBarComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    
        mapSettingsService = TestBed.inject(MapSettingsService)
        mapSettingsService.currentSettings = { ...mapSettingsService['DEFAULT_SETTINGS'] }
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
        expect(mapSettingsService).toBeTruthy()
    })

       
    it('should search for canton', () => {
        let cantonName = "Glarus"
        const submitEvent = new Event('submit')

        component.searchInput.nativeElement.value = cantonName
        component.searchByName(submitEvent)
        expect(mapSettingsService.currentSettings.cantonId).toBe(8)

        cantonName = "Schaffhausen"
        component.searchInput.nativeElement.value = cantonName
        component.searchByName(submitEvent)
        expect(mapSettingsService.currentSettings.cantonId).toBe(14)

        cantonName = "Zürich"
        component.searchInput.nativeElement.value = cantonName
        component.searchByName(submitEvent)
        expect(mapSettingsService.currentSettings.cantonId).toBe(1)

        cantonName = "Jura"
        component.searchInput.nativeElement.value = cantonName
        component.searchByName(submitEvent)
        expect(mapSettingsService.currentSettings.cantonId).toBe(26)
    })

    it('should reset search method called', () => {
        const cantonName = "Zug"
        component.searchInput.nativeElement.value = cantonName
        expect(component.searchInput.nativeElement.value).toBe(cantonName)
        component.resetSearchInput()
        expect(mapSettingsService.currentSettings.cantonId).toBe(undefined)
        expect(component.searchInput.nativeElement.value).toBe("")
    })

});
