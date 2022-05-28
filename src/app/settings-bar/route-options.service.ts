import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RouteOptions } from 'src/types/settings.types';

@Injectable({
  providedIn: 'root'
})
export class RouteOptionsService {

  private currentRouteOptions: RouteOptions = {
    national: true,
    regional: true,
    local: true,
    duration: 30
}

  // init values => currentRouteOptions
  private routeOptionsBehaviorSubject = new BehaviorSubject<RouteOptions>(this.currentRouteOptions)
  public routeOptionsObservable = this.routeOptionsBehaviorSubject.pipe()

  constructor() { }

  public emitValues(values: RouteOptions) {
    this.routeOptionsBehaviorSubject.next(values)
  }
}
