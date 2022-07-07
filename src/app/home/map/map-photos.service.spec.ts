import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MapPhotosService } from './map-photos.service';

describe('MapPhotosService', () => {
    let service: MapPhotosService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
        });
        service = TestBed.inject(MapPhotosService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

});
