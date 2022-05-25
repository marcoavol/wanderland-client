import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import ExifReader, { IccTags, Tags, XmpTags } from 'exifreader';

@Component({
    selector: 'app-photo-upload',
    templateUrl: './photo-upload.component.html',
    styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent implements OnInit {

    public uploadForm = new FormGroup({
        photo: new FormControl(undefined, { validators: [Validators.required] })
    })

    public photoURL?: string

    constructor(
        private modalService: NgbModal,
    ) { }

    ngOnInit(): void {
    }
 
    public openModal(content: any) {
        this.modalService.open(content, { centered: true })
    }

    public async handlePhotoInputAsync(event: Event): Promise<void> {
        const file = (event.target as HTMLInputElement).files?.item(0)
        if (!file) {
            this.uploadForm.reset()
            this.photoURL = undefined
            return
        }

        const urlReader = new FileReader()
        urlReader.onload = () => this.photoURL = urlReader.result as string
        urlReader.readAsDataURL(file)

        const metatags: Tags & XmpTags & IccTags = await ExifReader.load(this.uploadForm.value.photo as File)
        const location = { 
            lon: metatags.GPSLongitude?.description, 
            lat: metatags.GPSLatitude?.description 
        }
        console.warn(location)
        if (!location.lat || !location.lon) {
            // Display error message (photo doesn't include any gps data)
            return
        }

        // Check if location is near route

        // If location is on route, update form
        this.uploadForm.patchValue({ photo: file })

        // Else display error message (location is not near a known route)
        return
    }

    public submit(): void {
        const formData = new FormData()
        formData.append('photo', this.uploadForm.value.photo, this.uploadForm.value.photo.name)
        console.warn(formData.get('photo'))
    }

}
