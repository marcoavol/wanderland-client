import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Photo } from '../../types/photo.types';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapPhotosService {

    private readonly BASE_PATH = 'http://localhost:8080/photos/'

    private cachedPhotosByRouteId = new Map<number, Photo[]>()

    constructor(
        private http: HttpClient,
    ) { }

    private async loadPhotosByRouteIdAsync(routeId: number): Promise<Photo[]> {
        if (!this.cachedPhotosByRouteId.has(routeId)) {
            this.cachedPhotosByRouteId.set(routeId, await lastValueFrom(this.http.get(this.BASE_PATH + routeId)) as Photo[])
        }
        return this.cachedPhotosByRouteId.get(routeId)!
    }

    public async getPhotosByRouteId(routId: number): Promise<Photo[]> {
        return this.loadPhotosByRouteIdAsync(routId)
    }

}
