import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-photo-upload',
    templateUrl: './photo-upload.component.html',
    styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent implements OnInit {

    public photo: File | null

    constructor(
        private modalService: NgbModal,
    ) { }

    ngOnInit(): void {
    }
 
    public openModal(content: any) {
        this.modalService.open(content, { centered: true })
    }

    public handlePhotoInput(event: Event): void {
        const files = (event.target as HTMLInputElement).files
        this.photo = files?.length ? files[0] : null
    }

    public submit(event: Event): void {
        event.preventDefault()
        if (this.photo) {
            const formData = new FormData()
            formData.append(this.photo.name, this.photo, this.photo.name)
        }
        console.warn(this.photo)
    }

}
