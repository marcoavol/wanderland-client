import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'D3Test'

  public displayedRouteTypes: { national: boolean, regional: boolean, local: boolean }

}
