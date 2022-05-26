import { TestBed } from '@angular/core/testing';

import { RouteOptionsService } from './route-options.service';

describe('RouteOptionsService', () => {
  let service: RouteOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
