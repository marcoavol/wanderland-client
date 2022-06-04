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
    lengthMin: number;
    lengthMax: number;
    canton?: string;
} 

export type units = 'Meters' | 
                    'Kilometers' | 
                    'DaysHoursMinutes' 