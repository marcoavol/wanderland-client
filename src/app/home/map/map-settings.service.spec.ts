import { TestBed } from '@angular/core/testing';

import { MapSettingsService } from './map-settings.service';

describe('MapSettingsService', () => {
  let service: MapSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
