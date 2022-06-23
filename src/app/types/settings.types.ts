export interface MapSettings {
    national: boolean; 
    regional: boolean;
    local: boolean;
    durationMin: number;
    durationMax: number;
    elevationMin: number;
    elevationMax: number;
    lengthMin: number;
    lengthMax: number;
    lowSkills: boolean;
    mediumSkills: boolean;
    goodSkills: boolean;
    lowFitness: boolean;
    mediumFitness: boolean;
    goodFitness: boolean;
    includeStages: boolean;
    cantonId?: number;
} 

export type Unit = 'Meters' | 'Kilometers' | 'DaysHoursMinutes' 

export type RouteType = 'National' | 'Regional' | 'Lokal'