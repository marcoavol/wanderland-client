import { Injectable } from '@angular/core';
import { MapSettings } from '../types/settings.types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapSettingsService {

    public static readonly INITIAL_SETTINGS: MapSettings = {
        national: true,
        regional: true,
        local: true,
        durationMin: 0,
        durationMax: 17280,
        elevationMin: 0,
        elevationMax: 50000,
        descendingMin: 0,
        descendingMax: 50000,
        lengthMin: 0,
        lengthMax: 700000,
        lowSkills: true,
        mediumSkills: true,
        goodSkills: true,
        lowFitness: true,
        mediumFitness: true,
        goodFitness: true,
        cantonId: -1,
        includeStages: false//true
    }

    private _currentSettings: MapSettings = {...MapSettingsService.INITIAL_SETTINGS}

    private mapSettingsBehaviorSubject = new BehaviorSubject<MapSettings>(this._currentSettings)
    public mapSettingsObservable = this.mapSettingsBehaviorSubject.asObservable()

    constructor() { }

    get currentSettings(): MapSettings {
        return this._currentSettings
    }

    set currentSettings(updatedSettings: Partial<MapSettings>) {
        this._currentSettings = { ...this._currentSettings, ...updatedSettings }
        this.mapSettingsBehaviorSubject.next(this._currentSettings)
        console.warn(this.currentSettings)
    }

    public routeMeetsCurrentSettings(routeDatum: any): boolean {
        const result = 
            this.routeMeetsRouteTypeSetting(routeDatum?.properties.Typ_TR) && 
            this.routeMeetsDurationSetting(routeDatum?.properties.ZeitStZiR) &&
            this.routeMeetsElevationSetting(routeDatum?.properties.HoeheAufR) &&
            this.routeMeetsLengthSetting(routeDatum?.properties.LaengeR) &&
            this.routeMeetsTechniqueTypeSetting(routeDatum?.properties.TechnikR) &&
            this.routeMeetsFitnessLevelTypeSetting(routeDatum?.properties.KonditionR)
        return result
    }

    private routeMeetsRouteTypeSetting(routeType: 'National' | 'Regional' | 'Lokal'): boolean {
        switch (routeType) {
            case 'National': return this.currentSettings.national
            case 'Regional': return this.currentSettings.regional
            case 'Lokal': return this.currentSettings.local
            default: return false
        }
    }

    private routeMeetsStagesSetting(includeStages: boolean): boolean {
        return includeStages
    }

    private routeMeetsDurationSetting(duration: number): boolean {
        return duration >= this.currentSettings.durationMin && duration <= this.currentSettings.durationMax
    } 

    private routeMeetsElevationSetting(elevation: number): boolean {
        return elevation >= this.currentSettings.elevationMin && elevation <= this.currentSettings.elevationMax
    } 

    private routeMeetsLengthSetting(length: number): boolean {
        return length >= this.currentSettings.lengthMin && length <= this.currentSettings.lengthMax
    } 

    private routeMeetsTechniqueTypeSetting(techniqueType: 'leicht' | 'mittel' | 'schwer'): boolean {
        switch (techniqueType) {
            case 'leicht': return this.currentSettings.lowSkills
            case 'mittel': return this.currentSettings.mediumSkills
            case 'schwer': return this.currentSettings.goodSkills
            default: return false
        }
    }

    private routeMeetsFitnessLevelTypeSetting(fitnessLevelType: 'leicht' | 'mittel' | 'schwer'): boolean {
        switch (fitnessLevelType) {
            case 'leicht': return this.currentSettings.lowFitness
            case 'mittel': return this.currentSettings.mediumFitness
            case 'schwer': return this.currentSettings.goodFitness
            default: return this.currentSettings.lowFitness && this.currentSettings.mediumFitness && this.currentSettings.goodFitness
        }
    }
}
