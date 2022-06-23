import { Pipe, PipeTransform } from '@angular/core';
import { UnitUtilsService } from './unit-utils.service';

@Pipe({
    name: 'convertToUnit'
})
export class ConvertToUnitPipe implements PipeTransform {

    constructor(private unitUtilsService: UnitUtilsService) { }

    transform(value: number, unit: 'Meters' | 'Kilometers' | 'DaysHoursMinutes', formatWithUnit: boolean = false): string {
        return this.unitUtilsService.convertToUnitString(value, unit, formatWithUnit)
    }

}
