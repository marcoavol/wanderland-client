import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TrailOptions } from 'src/types/settings.types';

@Injectable({
  providedIn: 'root'
})
export class TrailOptionsService {

  private currentTrailOptions: TrailOptions = {
    national: true,
    regional: true,
    local: true
}

  // init values => currentTrailOptions
  private trailOptionsBehaviorSubject = new BehaviorSubject<TrailOptions>(this.currentTrailOptions)
  public trailOptionsObservable = this.trailOptionsBehaviorSubject.pipe()

  constructor() { }

  public emitValues(values: TrailOptions) {
    this.trailOptionsBehaviorSubject.next(values)
  }
}
