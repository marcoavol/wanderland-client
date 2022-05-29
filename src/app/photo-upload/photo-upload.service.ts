import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapComponent } from '../map/map.component';
import ExifReader from 'exifreader';
import imageCompression from 'browser-image-compression';
import { lastValueFrom } from 'rxjs';
import { PhotoDetails } from 'src/types/photo.types';

interface ValidationResult {
    valid: boolean;
    errorMessage?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PhotoUploadService {

    private readonly UPLOAD_PATH = 'http://localhost:8080/photos'

    private readonly COMPRESSION_OPTIONS = {
        maxSizeMB: 1,
        useWebWorker: true
    }

    private photo?: File
    private photoDetails?: PhotoDetails

    constructor(
        private http: HttpClient,
    ) { }

    public async getPhotoPreviewURLAsync(photo: File): Promise<string> {
        return new Promise((resolve, _) => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(photo)
            fileReader.onload = () => resolve(fileReader.result as string)
        })
    }

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

    public async uploadPhotoAsync(): Promise<void> {
        if (!this.photo || !this.photoDetails) return
        const compressedPhoto = await imageCompression(this.photo, this.COMPRESSION_OPTIONS)
        const formData = new FormData()
        formData.append('photo', compressedPhoto, compressedPhoto.name)
        formData.append('photoDetails', JSON.stringify(this.photoDetails))
        await lastValueFrom(this.http.post(this.UPLOAD_PATH, formData)).catch(error => console.warn(error))
    }
    
    private exifDateToIsoString(exifDate: string): string {
        const dateAndTimeStrings = exifDate.split(" ")
        const dateStringFormatted = dateAndTimeStrings[0].replace(/:/g, "-")
        const date = new Date(dateStringFormatted + " " + dateAndTimeStrings[1])
        return date.toISOString()
    }

}
