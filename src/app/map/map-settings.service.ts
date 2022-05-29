import { Injectable } from '@angular/core';
import { MapSettings } from '../types/settings.types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapSettingsService {

    private _currentSettings: MapSettings = {
        national: true,
        regional: true,
        local: true,
        durationMin: 30,
        durationMax: 80,
    }

    private mapSettingsBehaviorSubject = new BehaviorSubject<MapSettings>(this._currentSettings)
    public mapSettingsObservable = this.mapSettingsBehaviorSubject.pipe()

    constructor() { }

    get currentSettings() {
        return this._currentSettings
    }

    set currentSettings(updatedSettings: Partial<MapSettings>) {
        this._currentSettings = { ...this._currentSettings, ...updatedSettings }
        this.mapSettingsBehaviorSubject.next(this._currentSettings) 
    }

}
