import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapComponent } from '../map/map.component';
import ExifReader from 'exifreader';
import imageCompression from 'browser-image-compression';
import { lastValueFrom } from 'rxjs';

export interface PhotoDetails {
    captureIsoDate: string;
    lon: number;
    lat: number;
    routeIds: number[];
}

interface ValidationResult {
    valid: boolean;
    errorMessage?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PhotoUploadService {

    private readonly UPLOAD_PATH = ''

    private readonly COMPRESSION_OPTIONS = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
    }

    private photo?: File // extends BLOB (Binary Large Object)
    private photoDetails?: PhotoDetails

    constructor(
        private http: HttpClient,
    ) { }

    public async validatePhotoAsync(photo: File): Promise<ValidationResult> {
        this.photo = undefined
        this.photoDetails = undefined
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
        this.photo = photo
        this.photoDetails = {
            captureIsoDate: this.exifDateToIsoString(DateTimeOriginal.description),
            lon: lon,
            lat: lat,
            routeIds: routeIds
        }
        result.valid = true
        return result
    }

    public async uploadPhotoAndDetailsAsync(): Promise<void> {
        if (!this.photo || !this.photoDetails) return
        const compressedPhoto = await imageCompression(this.photo, this.COMPRESSION_OPTIONS)
        const formData = new FormData()
        formData.append('photo', compressedPhoto, compressedPhoto.name)
        formData.append('photoDetails', JSON.stringify(this.photoDetails))
        console.warn(formData.get('photo'))
        console.warn(formData.get('photoDetails'))
        await lastValueFrom(this.http.post(this.UPLOAD_PATH, formData))
    }
    
    private exifDateToIsoString(exifDate: string): string {
        const dateAndTimeStrings = exifDate.split(" ")
        const dateStringFormatted = dateAndTimeStrings[0].replace(/:/g, "-")
        const date = new Date(dateStringFormatted + " " + dateAndTimeStrings[1])
        return date.toISOString()
    }

}
