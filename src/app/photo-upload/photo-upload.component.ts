import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastsService } from '../toasts/toasts.service';
import { MapPhotosService } from '../map/map-photos.service';

@Component({
    selector: 'app-photo-upload',
    templateUrl: './photo-upload.component.html',
    styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent {
    
    public photoPreviewURL?: string
    public errorMessage?: string

    constructor(
        private mapPhotosService: MapPhotosService,
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
        this.photoPreviewURL = await this.mapPhotosService.getPhotoPreviewURLAsync(file)
        const { valid, errorMessage } = await this.mapPhotosService.validatePhotoAsync(file)
        if (!valid) {
            this.errorMessage = errorMessage
        }
    }

    public async submitAsync(): Promise<void> {
        const { success, errorMessage } = await this.mapPhotosService.uploadPhotoAsync()
        if (success) {
            this.toastService.show('', 'Vielen Dank, Ihr Foto wurde übermittelt!', 'bg-success text-light')
        } else if (errorMessage) {
            this.toastService.show('', errorMessage, 'bg-danger text-light')
        }
        this.closeModal()
    }
    
    public reset(): void {
        this.photoPreviewURL = undefined
        this.errorMessage = undefined
    }

}

