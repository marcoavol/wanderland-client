import { TestBed } from '@angular/core/testing';

import { UnitUtilsService } from './unit-utils.service';

describe('UnitUtilsService', () => {
  let service: UnitUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
