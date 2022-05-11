import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  @Output()
  onDisplayedRouteTypesChanged: EventEmitter<{ national: boolean, regional: boolean, local: boolean }> = new EventEmitter()

  public displayedRouteTypeForm = new FormGroup({
    national: new FormControl(true),
    regional: new FormControl(true),
    local: new FormControl(true),
  })

  constructor(private router: Router) { 
      console.warn(router.getCurrentNavigation)
  }

  ngOnInit(): void {
    this.displayedRouteTypesChanged()
  }

  public displayedRouteTypesChanged(): void {
    this.onDisplayedRouteTypesChanged.emit(this.displayedRouteTypeForm.value)
  }

}
