import { Component, Input, OnInit } from '@angular/core';
import { Photo } from '../../types/photo.types';

@Component({
    selector: 'app-photo-carousel',
    templateUrl: './photo-carousel.component.html',
    styleUrls: ['./photo-carousel.component.scss']
})
export class PhotoCarouselComponent implements OnInit {

    @Input()
    photos: Photo[]

    @Input()
    title: string

    @Input()
    subtitle: string

    constructor(

    ) { }

    ngOnInit(): void {
    }


}
