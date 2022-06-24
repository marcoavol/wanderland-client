import { Injectable } from '@angular/core';
import { MapSettings, Difficulty, RouteType } from '../../types/settings.types';
import { BehaviorSubject } from 'rxjs';
import { RouteDatum, RouteProperties, StageProperties } from '../../types/map.types';

@Injectable({
    providedIn: 'root'
})
export class MapSettingsService {

    private _currentSettings: MapSettings = {
        national: true,
        regional: true,
        local: true,
        durationMin: 0,
        durationMax: 17280,
        elevationMin: 0,
        elevationMax: 50000,
        lengthMin: 0,
        lengthMax: 700000,
        lowSkills: true,
        mediumSkills: true,
        goodSkills: true,
        lowFitness: true,
        mediumFitness: true,
        goodFitness: true,
        cantonId: -1,
        includeStages: true
    }

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

    public routeOrStageMeetsCurrentSettings(routeDatum: RouteDatum): boolean {
        const routeProperties = routeDatum.properties as RouteProperties
        const result = 
            this.routeMeetsCurrentSettings(routeProperties) || 
            routeDatum.stages.some(stage => this.stageMeetsCurrentSettings(stage.properties))  
        return result
    }

    public routeMeetsCurrentSettings(routeProperties: RouteProperties): boolean {
        const result = 
            this.meetsRouteTypeSetting(routeProperties.Typ_TR as RouteType) && 
            this.meetsDurationSetting(routeProperties.ZeitStZiR) &&
            this.meetsElevationSetting(routeProperties.HoeheAufR) &&
            this.meetsLengthSetting(routeProperties.LaengeR) &&
            this.meetsTechniqueDifficultySetting(routeProperties.TechnikR as Difficulty) &&
            this.meetsFitnessDifficultySetting(routeProperties.KonditionR as Difficulty)
        return result
    }

    public stageMeetsCurrentSettings(stageProperties: StageProperties): boolean {
        const result = 
            this.meetsDurationSetting(stageProperties.ZeitStZiE) &&
            this.meetsElevationSetting(stageProperties.HoeheAufE) &&
            this.meetsLengthSetting(stageProperties.DistanzE) &&
            this.meetsTechniqueDifficultySetting(stageProperties.TechnikE as Difficulty) &&
            this.meetsFitnessDifficultySetting(stageProperties.KonditionE as Difficulty)
        return result
    }

    private meetsRouteTypeSetting(routeType: RouteType): boolean {
        switch (routeType) {
            case 'National': return this.currentSettings.national
            case 'Regional': return this.currentSettings.regional
            case 'Lokal': return this.currentSettings.local
            default: return false
        }
    }

    private meetsDurationSetting(duration: number): boolean {
        return duration >= this.currentSettings.durationMin && duration <= this.currentSettings.durationMax
    } 

    private meetsElevationSetting(elevation: number): boolean {
        return elevation >= this.currentSettings.elevationMin && elevation <= this.currentSettings.elevationMax
    } 

    private meetsLengthSetting(length: number): boolean {
        return length >= this.currentSettings.lengthMin && length <= this.currentSettings.lengthMax
    } 

    private meetsTechniqueDifficultySetting(difficulty: Difficulty): boolean {
        switch (difficulty) {
            case 'leicht': return this.currentSettings.lowSkills
            case 'mittel': return this.currentSettings.mediumSkills
            case 'schwer': return this.currentSettings.goodSkills
            default: return false
        }
    }

    private meetsFitnessDifficultySetting(difficulty: Difficulty): boolean {
        switch (difficulty) {
            case 'leicht': return this.currentSettings.lowFitness
            case 'mittel': return this.currentSettings.mediumFitness
            case 'schwer': return this.currentSettings.goodFitness
            default: return this.currentSettings.lowFitness && this.currentSettings.mediumFitness && this.currentSettings.goodFitness
        }
    }
    
}
