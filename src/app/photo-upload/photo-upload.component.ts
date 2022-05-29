import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PhotoUploadService } from './photo-upload.service';
import { ToastsService } from '../toasts/toasts.service';

@Component({
    selector: 'app-photo-upload',
    templateUrl: './photo-upload.component.html',
    styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent {
    
    public photoPreviewURL?: string
    public errorMessage?: string

    constructor(
        private photoUploadService: PhotoUploadService,
        private modalService: NgbModal,
        private toastService: ToastsService,
    ) { }
 
    public openModal(content: any) {
        this.modalService.open(content, { centered: true })
    }

    public closeModal() {
        this.modalService.dismissAll()
        this.reset()
    }

    public async handlePhotoInputAsync(event: Event): Promise<void> {
        const file = (event.target as HTMLInputElement).files?.item(0)
        if (!file) return 
        this.reset()
        this.photoPreviewURL = await this.photoUploadService.getPhotoPreviewURLAsync(file)
        const { valid, errorMessage } = await this.photoUploadService.validatePhotoAsync(file)
        if (!valid) {
            this.errorMessage = errorMessage
        }
    }

    public submit(): void {
        this.photoUploadService.uploadPhotoAsync()
        this.closeModal()
        this.toastService.show('', 'Vielen Dank, Ihr Foto wurde übermittelt!', 'bg-success text-light')
    }
    
    public reset(): void {
        this.photoPreviewURL = undefined
        this.errorMessage = undefined
    }

}

