import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-photo-upload',
    templateUrl: './photo-upload.component.html',
    styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent implements OnInit {

    public photoPreviewURL: string | undefined

    public uploadForm = new FormGroup({
        photo: new FormControl(undefined, { validators: [Validators.required] })
    })

    constructor(
        private modalService: NgbModal,
    ) { }

    ngOnInit(): void {
    }
 
    public openModal(content: any) {
        this.modalService.open(content, { centered: true })
    }

    public handlePhotoInput(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.item(0)
        this.uploadForm.patchValue({ photo: file })
        this.photoPreviewURL = undefined
        if (file) {
            const reader = new FileReader()
            reader.onload = () => this.photoPreviewURL = reader.result as string
            reader.readAsDataURL(file)
        }
    }

    public submit(): void {
        const formData = new FormData()
        formData.append('photo', this.uploadForm.value.photo, this.uploadForm.value.photo.name)
        console.warn(formData.get('photo'))
    }

}
