import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent implements OnInit {

  constructor(
      private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true })
  }

}
