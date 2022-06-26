import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UnitUtilsService {

    constructor() { }

    public convertToUnitString(value: number, unit: 'Meters' | 'Kilometers' | 'DaysHoursMinutes', formatWithUnit: boolean = false): string {
        switch (unit) {
            case 'Meters': return formatWithUnit ? String(value) + 'm' : String(value)
            case 'Kilometers': return formatWithUnit ? (value/1000).toFixed(1) + 'km' : String(value/1000)
            case 'DaysHoursMinutes': return this.convertToDaysHoursMinutesString(value, formatWithUnit)
            default: return ''   
        }
    }

    private convertToDaysHoursMinutesString(minutes: number, formatWithUnit: boolean = false): string {
        let d = Math.floor(minutes / (60 * 24))
        let h = (Math.floor(minutes / 60)) % 24
        let m = minutes % 60
        if (formatWithUnit) {
            return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`
        }
        let days = d < 10 ? '0' + d : d 
        let hrs = h < 10 ? '0' + h : h 
        let mins = m < 10 ? '0' + m : m 
        return d > 0 ? `${days}:${hrs}:${mins}` : `${hrs}:${mins}`
    }

}
