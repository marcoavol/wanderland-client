import { Injectable } from '@angular/core';
import { MapSettings, Difficulty, RouteType } from '../../types/settings.types';
import { BehaviorSubject } from 'rxjs';
import { RouteDatum, RouteProperties, StageProperties } from '../../types/map.types';

@Injectable({
    providedIn: 'root'
})
export class MapSettingsService {

    public readonly DEFAULT_SETTINGS: MapSettings = {
        national: true,
        regional: true,
        local: true,
        durationMin: 0,
        durationMax: 720,
        distanceMin: 0,
        distanceMax: 30000,
        elevationMin: 0,
        elevationMax: 2500,
        descendingMin: 0,
        descendingMax: 2500,
        skillsEasy: true,
        skillsMedium: true,
        skillsHard: true,
        fitnessEasy: true,
        fitnessMedium: true,
        fitnessHard: true,
        cantonId: undefined,
        includeStages: true
    }
    
    private _currentSettings: MapSettings = { ...this.DEFAULT_SETTINGS }

    private mapSettingsBehaviorSubject = new BehaviorSubject<MapSettings>(this._currentSettings)
    public mapSettingsObservable = this.mapSettingsBehaviorSubject.asObservable()

    constructor() { }

    get currentSettings(): MapSettings {
        return this._currentSettings
    }

    set currentSettings(updatedSettings: Partial<MapSettings>) {
        this._currentSettings = { ...this._currentSettings, ...updatedSettings }
        this.mapSettingsBehaviorSubject.next(this._currentSettings) 
    }

    public getMaxValuesDependingOnIncludeStagesSetting(includeStages: boolean): { [key: string]: number } {
        return {
            durationMax: includeStages ? this.DEFAULT_SETTINGS.durationMax : 17280,
            distanceMax: includeStages ? this.DEFAULT_SETTINGS.distanceMax : 700000,
            elevationMax: includeStages ? this.DEFAULT_SETTINGS.elevationMax: 50000,
            descendingMax: includeStages ? this.DEFAULT_SETTINGS.descendingMax : 50000
        } 
    }

    public routeOrStageMeetsCurrentSettings(routeDatum: RouteDatum): boolean {
        const routeProperties = routeDatum.properties as RouteProperties
        const result = 
            this.meetsRouteTypeSetting(routeProperties.Typ_TR as RouteType) && (
                this.routeMeetsCurrentSettings(routeProperties) || 
                routeDatum.stages.some(stage => this.stageMeetsCurrentSettings(stage.properties)) 
            )
        return result
    }

    public routeMeetsCurrentSettings(routeProperties: RouteProperties): boolean {
        const result = 
            this.meetsDurationSetting(routeProperties.ZeitStZiR || routeProperties.ZeitZiStR) &&
            this.meetsDistanceSetting(routeProperties.LaengeR) &&
            this.meetsElevationSetting(routeProperties.HoeheAufR) &&
            this.meetsDescendingSetting(routeProperties.HoeheAbR) &&
            this.meetsSkillsDifficultySetting(routeProperties.TechnikR as Difficulty) &&
            this.meetsFitnessDifficultySetting(routeProperties.KonditionR as Difficulty)
        return result
    }

    public stageMeetsCurrentSettings(stageProperties: StageProperties): boolean {
        const result = 
            this.meetsDurationSetting(stageProperties.ZeitStZiE || stageProperties.ZeitZiStE) &&
            this.meetsDistanceSetting(stageProperties.DistanzE) &&
            this.meetsElevationSetting(stageProperties.HoeheAufE) &&
            this.meetsDescendingSetting(stageProperties.HoeheAbE) &&
            this.meetsSkillsDifficultySetting(stageProperties.TechnikE as Difficulty) &&
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

    private meetsDescendingSetting(descending: number): boolean {
        return descending >= this.currentSettings.descendingMin && descending <= this.currentSettings.descendingMax
    } 

    private meetsDistanceSetting(length: number): boolean {
        return length >= this.currentSettings.distanceMin && length <= this.currentSettings.distanceMax
    } 

    private meetsSkillsDifficultySetting(difficulty: Difficulty): boolean {
        switch (difficulty) {
            case 'leicht': return this.currentSettings.skillsEasy
            case 'mittel': return this.currentSettings.skillsMedium
            case 'schwer': return this.currentSettings.skillsHard
            default: return this.currentSettings.skillsEasy && this.currentSettings.skillsMedium && this.currentSettings.skillsHard
        }
    }

    private meetsFitnessDifficultySetting(difficulty: Difficulty): boolean {
        switch (difficulty) {
            case 'leicht': return this.currentSettings.fitnessEasy
            case 'mittel': return this.currentSettings.fitnessMedium
            case 'schwer': return this.currentSettings.fitnessHard
            default: return this.currentSettings.fitnessEasy && this.currentSettings.fitnessMedium && this.currentSettings.fitnessHard
        }
    }

}
