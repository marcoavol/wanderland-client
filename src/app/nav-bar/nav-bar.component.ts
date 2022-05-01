import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  @Output()
  onDisplayedRouteTypesChanged: EventEmitter<{ national: boolean, regional: boolean, local: boolean }>

  public displayedRouteTypeForm: FormGroup

  constructor() {
    this.displayedRouteTypeForm = new FormGroup({
      national: new FormControl(true),
      regional: new FormControl(true),
      local: new FormControl(true),
    })
    this.onDisplayedRouteTypesChanged = new EventEmitter()
  }

  ngOnInit(): void {
    this.displayedRouteTypesChanged()
  }

  public displayedRouteTypesChanged(): void {
    this.onDisplayedRouteTypesChanged.emit(this.displayedRouteTypeForm.value)
  }

}
