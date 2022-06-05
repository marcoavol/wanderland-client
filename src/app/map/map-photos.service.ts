import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CreatePhotoDTO, Photo } from '../types/photo.types';
import { lastValueFrom, Subject } from 'rxjs';
import { MapComponent } from './map.component';
import ExifReader from 'exifreader';
import imageCompression from 'browser-image-compression';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PhotoCarouselComponent } from '../photo-carousel/photo-carousel.component';

interface ValidationResult {
    valid: boolean;
    errorMessage?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MapPhotosService {

    private readonly BASE_PATH = 'http://localhost:8080/photos'

    private readonly COMPRESSION_OPTIONS = {
        maxSizeMB: 1,
        useWebWorker: true
    }

    private uploadDTO?: CreatePhotoDTO

    private uploadSubject = new Subject<void>()
    public uploadObservable = this.uploadSubject.asObservable()

    private cachedPhotosByRouteId = new Map<number, Photo[]>() 

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
    ) { }

    public async getPhotoPreviewURLAsync(photo: File): Promise<string> {
        return new Promise((resolve, _) => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(photo)
            fileReader.onload = () => resolve(fileReader.result as string)
        })
    }

    public async validatePhotoAsync(photo: File): Promise<ValidationResult> {
        this.uploadDTO = undefined
        const result: ValidationResult = { valid: false }
        const { DateTimeOriginal, GPSLongitude, GPSLatitude } = await ExifReader.load(photo)
        if (!DateTimeOriginal || !GPSLongitude || !GPSLatitude) {
            result.errorMessage = 'Das Foto verfügt nicht über die notwendigen EXIF-Daten'
            return result
        }
        const lon = parseFloat(GPSLongitude.description)
        const lat = parseFloat(GPSLatitude.description)
        const routeIds = MapComponent.nearKnownRoutes([lon, lat])
        if (!routeIds.length) {
            result.errorMessage = 'Das Foto wurde auf keiner bekannten Route aufgenommen'
            return result
        }
        this.uploadDTO = {
            photo: photo,
            info: {
                captureIsoDate: this.exifDateToIsoString(DateTimeOriginal.description),
                lon: lon,
                lat: lat,
                routeIds: routeIds
            }
        }
        result.valid = true
        return result
    }

    public async uploadPhotoAsync(): Promise<void> {
        if (!this.uploadDTO) return console.warn('Unable to upload photo since no DTO is present.')
        const compressedPhoto = await imageCompression(this.uploadDTO.photo, this.COMPRESSION_OPTIONS)
        const formData = new FormData()
        formData.append('photo', compressedPhoto, compressedPhoto.name)
        formData.append('info', JSON.stringify(this.uploadDTO.info))
        await lastValueFrom(this.http.post(this.BASE_PATH, formData))
            .catch((e: Error) => console.error(`Error while uploading photo: ${e.message}`))
        this.uploadDTO.info.routeIds.forEach(routeId => this.cachedPhotosByRouteId.delete(routeId))
        this.uploadSubject.next()
    }

    public async getPhotosByRouteId(routId: number): Promise<Photo[]> {
        return this.loadPhotosByRouteIdAsync(routId)
    }

    private async loadPhotosByRouteIdAsync(routeId: number): Promise<Photo[]> {
        if (!this.cachedPhotosByRouteId.has(routeId)) {
            const photos = <Photo[]>await lastValueFrom(this.http.get(this.BASE_PATH + '/' + routeId))
                .catch((e: Error) => console.error(`Error while loading photos for routeId ${routeId}: ${e.message}`))
            this.cachedPhotosByRouteId.set(routeId, photos)
        }
        return this.cachedPhotosByRouteId.get(routeId)!
    }

    private exifDateToIsoString(exifDate: string): string {
        const dateAndTimeStrings = exifDate.split(" ")
        const dateStringFormatted = dateAndTimeStrings[0].replace(/:/g, "-")
        const date = new Date(dateStringFormatted + " " + dateAndTimeStrings[1])
        return date.toISOString()
    }

    public openCarouselModal(photos: Photo[]): void {
        const modalRef = this.modalService.open(PhotoCarouselComponent, { centered: true })
        modalRef.componentInstance.photos = photos
    }

    public closeCarouselModal(): void {
        this.modalService.dismissAll()
    }

}
