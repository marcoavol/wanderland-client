import { TestBed } from '@angular/core/testing';
import { MapSettingsService } from './map-settings.service';
import { RouteProperties } from '../../types/map.types';

fdescribe('MapSettingsService', () => {
    let service: MapSettingsService

    const mockRouteProperties: RouteProperties = {
        Typ_TR: 'Regional',
        LaengeR: 10000.30,
        ZeitStZiR: 450,
        HoeheAufR: 800,
        HoeheAbR: 750,
        HoeheMaxR: 1500,
        HoeheMinR: 700,
        KonditionR: 'schwer',
        TechnikR: 'mittel',
        AOrt: '',
        Abwicklung: '',
        AuspraegR: '',
        BeschreibR: '',
        Change_Dt: '',
        GueltigJ: 0,
        NichtPubFh: 0,
        OBJECTID: 0,
        ReStR: '',
        Richtung: '',
        Routenart: '',
        SHAPE_Leng: 0,
        TechNameR: '',
        TechNrR_ID: 0,
        TourNameR: '',
        TourNrR: '',
        UnsEtpZiel: 0,
        ZOrt: '',
        ZeitZiStR: 0,
    }

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(MapSettingsService)
        service.currentSettings = { ...service['DEFAULT_SETTINGS'] }
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })

    it('should determine if route meets current routeType setting', () => {
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { local: false, regional: true, national: false }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { local: true, regional: true, national: false }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { local: false, regional: true, national: true }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { local: true, regional: true, national: true }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { local: false, regional: false, national: false }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
        service.currentSettings = { local: true, regional: false, national: false }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
        service.currentSettings = { local: true, regional: false, national: true }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
    })

    it('should determine if route meets current duration settings', () => {
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { durationMin: 400, durationMax: 500 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { durationMin: 450, durationMax: 450 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { durationMin: 451, durationMax: 460 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
        service.currentSettings = { durationMin: 400, durationMax: 449 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
    })

    it('should determine if route meets current length settings', () => {
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { distanceMin: 5000, distanceMax: 12000 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { distanceMin: 10000.30, distanceMax: 10000.30 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { distanceMin: 10000.31, distanceMax: 12000 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
        service.currentSettings = { distanceMin: 5000, distanceMax: 10000.29 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
    })

    it('should determine if route meets current elevation settings', () => {
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { elevationMin: 500, elevationMax: 1000 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { elevationMin: 800, elevationMax: 800 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { elevationMin: 801, elevationMax: 850 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
        service.currentSettings = { elevationMin: 750, elevationMax: 799 }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
    })

    it('should determine if route meets current tequnique difficulty settings', () => {
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { skillsEasy: false, skillsMedium: true, skillsHard: false }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { skillsEasy: true, skillsMedium: true, skillsHard: false }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { skillsEasy: false, skillsMedium: true, skillsHard: true }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { skillsEasy: true, skillsMedium: true, skillsHard: true }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeTrue()
        service.currentSettings = { skillsEasy: false, skillsMedium: false, skillsHard: false }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
        service.currentSettings = { skillsEasy: true, skillsMedium: false, skillsHard: false }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
        service.currentSettings = { skillsEasy: true, skillsMedium: false, skillsHard: true }
        expect(service.routeMeetsCurrentSettings(mockRouteProperties)).toBeFalse()
    })

    it('should determine if route meets current fitness difficulty settings', () => {

    })
})
