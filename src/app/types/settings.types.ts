export interface MapSettings {
    national: boolean; 
    regional: boolean;
    local: boolean;
    includeStages: boolean;
    durationMin: number;
    durationMax: number;
    elevationMin: number;
    elevationMax: number;
    descendingMin: number;
    descendingMax: number;
    lengthMin: number;
    lengthMax: number;
    lowSkills: boolean;
    mediumSkills: boolean;
    goodSkills: boolean;
    lowFitness: boolean;
    mediumFitness: boolean;
    goodFitness: boolean;
    cantonId?: number;
} 

export type units = 'Meters' | 
                    'Kilometers' | 
                    'DaysHoursMinutes' 