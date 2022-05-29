import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RouteOptions } from '../types/settings.types';

@Injectable({
  providedIn: 'root'
})
export class RouteOptionsService {

  private currentRouteOptions: RouteOptions = {
    national: true,
    regional: true,
    local: true,
    durationMin: 300,
    durationMax: 700
}

  // init values => currentRouteOptions
  private routeOptionsBehaviorSubject = new BehaviorSubject<RouteOptions>(this.currentRouteOptions)
  public routeOptionsObservable = this.routeOptionsBehaviorSubject.pipe()

  constructor() { }

  public emitValues(values: RouteOptions) {
    this.routeOptionsBehaviorSubject.next(values)
  }
}
