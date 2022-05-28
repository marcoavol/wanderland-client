import { Injectable } from '@angular/core';

interface ToastInfo {
    header: string;
    body: string;
    cssClass: string;
}

@Injectable({
    providedIn: 'root'
})
export class ToastsService {

    toasts: ToastInfo[] = [];

    show(header: string, body: string, cssClass: string) {
        this.toasts.push({ header, body, cssClass });
    }

    remove(toast: ToastInfo) {
        this.toasts = this.toasts.filter(toast => toast !== toast);
    }

    clear() {
        this.toasts.splice(0, this.toasts.length);
    }

}