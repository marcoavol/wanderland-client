import { TestBed } from '@angular/core/testing';

import { TrailOptionsService } from './trail-options.service';

describe('TrailOptionsService', () => {
  let service: TrailOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrailOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
