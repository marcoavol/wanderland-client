import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Photo, PhotoInfo } from '../../types/photo.types';
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

interface UploadResult {
    success: boolean;
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

    private photoUpload?: { file: File, info: PhotoInfo }

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
        this.photoUpload = undefined
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
        this.photoUpload = {
            file: photo,
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

    public async uploadPhotoAsync(): Promise<UploadResult> {
        const result: UploadResult = { success: false }
        if (!this.photoUpload) {
            console.warn('Unable to upload photo since no upload data is present.')
            return result
        }
        const compressedPhoto = await imageCompression(this.photoUpload.file, this.COMPRESSION_OPTIONS)
        const formData = new FormData()
        formData.append('photoFile', compressedPhoto, compressedPhoto.name)
        formData.append('photoInfo', new Blob([JSON.stringify(this.photoUpload.info)], { type: 'application/json' }))
        await lastValueFrom(this.http.post(this.BASE_PATH, formData))
            .then(response => {
                (<Photo>response).routeIds.forEach(routeId => this.cachedPhotosByRouteId.delete(routeId))
                this.uploadSubject.next()
                result.success = true
            })
            .catch((error: HttpErrorResponse) => {
                if (error.status === 403) {
                    console.warn(error.error)
                    result.errorMessage = 'Dieses Foto wurde bereits hochgeladen.'
                } else {
                    console.error(`Error while uploading photo: ${error.error}`)
                }
            })
        return result
    }

    public async getPhotosByRouteId(routId: number): Promise<Photo[]> {
        return this.loadPhotosByRouteIdAsync(routId)
    }

    private async loadPhotosByRouteIdAsync(routeId: number): Promise<Photo[]> {
        if (!this.cachedPhotosByRouteId.has(routeId)) {
            await lastValueFrom(this.http.get(this.BASE_PATH + '/' + routeId))
                .then(response => this.cachedPhotosByRouteId.set(routeId, <Photo[]>response))
                .catch((error: HttpErrorResponse) => console.error(`Error while loading photos for routeId ${routeId}: ${error.error}`))
        }           
        return this.cachedPhotosByRouteId.get(routeId) ?? []
    }

    private exifDateToIsoString(exifDate: string): string {
        const dateAndTimeStrings = exifDate.split(" ")
        const dateStringFormatted = dateAndTimeStrings[0].replace(/:/g, "-")
        const date = new Date(dateStringFormatted + " " + dateAndTimeStrings[1])
        return date.toISOString()
    }

    public openCarouselModal(photos: Photo[]): void {
        const modalRef = this.modalService.open(PhotoCarouselComponent, { centered: true, windowClass: 'photo-carousel' })
        modalRef.componentInstance.photos = photos
    }

    public closeCarouselModal(): void {
        this.modalService.dismissAll()
    }

}
