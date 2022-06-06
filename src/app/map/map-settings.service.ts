import { Injectable } from '@angular/core';
import { MapSettings } from '../types/settings.types';
import { BehaviorSubject } from 'rxjs';
import { descending } from 'd3';

@Injectable({
    providedIn: 'root'
})
export class MapSettingsService {

    private _currentSettings: MapSettings = {
        national: true,
        regional: true,
        local: true,
        durationMin: 0,
        durationMax: 10000,
        elevationMin: 0,
        elevationMax: 2000,
        descendingMin: 0,
        descendingMax: 2000,
        lengthMin: 0,
        lengthMax: 100000,
    }

    private mapSettingsBehaviorSubject = new BehaviorSubject<MapSettings>(this._currentSettings)
    public mapSettingsObservable = this.mapSettingsBehaviorSubject.pipe()

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
            this.routeMeetsDurationSetting(routeDatum?.properties.ZeitStZiR) /*&&
            this.routeMeetsElevationSetting(routeDatum?.properties.HoeheAufR) &&
            this.routeMeetsDescendingSetting(routeDatum?.properties.HoeheAbR) &&
            this.routeMeetsLengthSetting(routeDatum?.properties.LaengeR) */
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

    private routeMeetsDurationSetting(duration: number): boolean {
        return duration >= this.currentSettings.durationMin && duration <= this.currentSettings.durationMax
    } 

    private routeMeetsElevationSetting(elevation: number): boolean {
        return elevation >= this.currentSettings.elevationMin && elevation <= this.currentSettings.elevationMax
    } 

    private routeMeetsDescendingSetting(descending: number): boolean {
        return descending >= this.currentSettings.descendingMin && descending <= this.currentSettings.elevationMax
    }

    private routeMeetsLengthSetting(length: number): boolean {
        return length >= this.currentSettings.lengthMin && length <= this.currentSettings.lengthMax
    } 
}
