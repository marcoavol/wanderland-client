import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastsComponent } from './toasts.component';

@NgModule({
    declarations: [
        ToastsComponent,
    ],
    imports: [
        CommonModule,
        NgbModule,
    ],
    exports: [
        ToastsComponent,
    ]
})
export class ToastsModule { }
