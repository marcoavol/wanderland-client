import { TestBed } from '@angular/core/testing';

import { UnitUtilsServiceService } from './unit-utils-service.service';

describe('UnitUtilsServiceService', () => {
  let service: UnitUtilsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitUtilsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
