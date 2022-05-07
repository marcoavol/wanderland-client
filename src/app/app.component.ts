import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'Wanderland'

  public displayedRouteTypes: { national: boolean, regional: boolean, local: boolean }

}
