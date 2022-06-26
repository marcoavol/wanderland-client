export interface MapSettings {
    national: boolean; 
    regional: boolean;
    local: boolean;
    durationMin: number;
    durationMax: number;
    elevationMin: number;
    elevationMax: number;
    descendingMin: number;
    descendingMax: number;
    distanceMin: number;
    distanceMax: number;
    skillsEasy: boolean;
    skillsMedium: boolean;
    skillsHard: boolean;
    fitnessEasy: boolean;
    fitnessMedium: boolean;
    fitnessHard: boolean;
    includeStages: boolean;
    cantonId?: number;
} 

export type Unit = 'Meters' | 'Kilometers' | 'DaysHoursMinutes' 

export type RouteType = 'National' | 'Regional' | 'Lokal'

export type Difficulty = 'leicht' | 'mittel' | 'schwer'