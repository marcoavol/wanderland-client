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
    easy: boolean;
    medium: boolean;
    hard: boolean;
    lowFitness: boolean;
    mediumFitness: boolean;
    goodFitness: boolean;
    canton?: string;
} 

export type units = 'Meters' | 
                    'Kilometers' | 
                    'DaysHoursMinutes' 