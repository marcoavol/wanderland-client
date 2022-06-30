import { TestBed } from '@angular/core/testing';
import { UnitUtilsService } from './unit-utils.service';

fdescribe('UnitUtilsService', () => {
  let service: UnitUtilsService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(UnitUtilsService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  })

  it('convert to kilometers', () => {
    expect(service.convertToUnitString(0, 'Kilometers')).toBe("0")
    expect(service.convertToUnitString(50000, 'Kilometers')).toBe("50")
    expect(service.convertToUnitString(1000000, 'Kilometers')).toBe("1000")
  })

  it('convert to days hours and minutes', () => {
    expect(service.convertToUnitString(15, 'DaysHoursMinutes')).toBe("00:15")
    expect(service.convertToUnitString(1440, 'DaysHoursMinutes')).toBe("01:00:00")
    expect(service.convertToUnitString(333, 'DaysHoursMinutes')).toBe("05:33")
    expect(service.convertToUnitString(7932, 'DaysHoursMinutes')).toBe("05:12:12")
  })

  it('convert to days hours and minutes => formatWithUnit enabled', () => {
    expect(service.convertToUnitString(15, 'DaysHoursMinutes', true)).toBe("0h 15m")
    expect(service.convertToUnitString(1440, 'DaysHoursMinutes', true)).toBe("1d 0h 0m")
    expect(service.convertToUnitString(333, 'DaysHoursMinutes', true)).toBe("5h 33m")
    expect(service.convertToUnitString(18364, 'DaysHoursMinutes', true)).toBe("12d 18h 4m")
  })

});
